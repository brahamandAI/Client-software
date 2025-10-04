import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import Issue from '@/models/Issue';
import { sendIssueAlert } from '@/lib/mailer';
import { z } from 'zod';

const createIssueSchema = z.object({
  amenityId: z.string().min(1, 'Amenity ID is required'),
  priority: z.enum(['low', 'medium', 'high']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reportedBy: z.string().optional(),
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    await connectDB();

    // Import all required models
    const Station = (await import('@/models/Station')).default;
    const StationAmenity = (await import('@/models/StationAmenity')).default;

    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let query: any = {};

    // Apply filters
    if (stationId) query.stationId = stationId;
    if (status) {
      if (status === 'open') {
        query.status = { $in: ['reported', 'acknowledged', 'assigned'] };
      } else {
        query.status = status;
      }
    }
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Date range filter
    if (dateFrom || dateTo) {
      query.reportedAt = {};
      if (dateFrom) query.reportedAt.$gte = new Date(dateFrom);
      if (dateTo) query.reportedAt.$lte = new Date(dateTo);
    }

    // If user is not SuperAdmin, filter by their station
    if (user.role !== 'SuperAdmin' && user.stationId) {
      query.stationId = user.stationId;
    }

    const issues = await Issue.find(query)
      .populate('stationId', 'name code')
      .populate('stationAmenityId')
      .populate('stationAmenityId.amenityTypeId', 'name')
      .populate('reportedById', 'name email')
      .populate('assignedToId', 'name email')
      .sort({ reportedAt: -1 });

    return NextResponse.json(issues, { headers: corsHeaders });
  } catch (error) {
    console.error('Get issues error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const stationAmenityId = formData.get('amenityId') as string;
    const priority = formData.get('priority') as string;
    const description = formData.get('description') as string;
    const reportedBy = formData.get('reportedBy') as string;
    const photos = formData.getAll('photos') as File[];

    // Validate required fields
    if (!stationAmenityId || !priority || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get amenity to find station
    const StationAmenity = (await import('@/models/StationAmenity')).default;
    const Station = (await import('@/models/Station')).default;
    const amenity = await StationAmenity.findById(stationAmenityId).populate('stationId');
    
    if (!amenity) {
      return NextResponse.json(
        { error: 'Amenity not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const stationId = amenity.stationId._id;

    // Process photos
    const photoUrls: string[] = [];
    
    if (photos && photos.length > 0) {
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      const { v4: uuidv4 } = await import('uuid');
      
      for (const photo of photos) {
        if (photo.size > 0) {
          const bytes = await photo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate unique filename
          const fileExtension = photo.name.split('.').pop() || 'jpg';
          const filename = `${uuidv4()}.${fileExtension}`;
          
          // Create directory structure
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const uploadDir = join(process.cwd(), 'public', 'uploads', year.toString(), month);
          
          try {
            await mkdir(uploadDir, { recursive: true });
          } catch (error) {
            // Directory might already exist
          }
          
          // Save file
          const filepath = join(uploadDir, filename);
          await writeFile(filepath, buffer);
          
          // Store relative path
          photoUrls.push(`${year}/${month}/${filename}`);
        }
      }
    }

    const issue = await Issue.create({
      stationId,
      stationAmenityId,
      reportedById: user.id,
      priority,
      description,
      photos: photoUrls,
    });

    await issue.populate([
      { path: 'stationId', select: 'name code' },
      { path: 'stationAmenityId' },
      { path: 'stationAmenityId.amenityTypeId', select: 'name' },
      { path: 'reportedById', select: 'name email' },
    ]);

    // Send email alert for high priority issues
    if (priority === 'high') {
      await sendIssueAlert(issue, amenity.stationId);
    }

    return NextResponse.json(issue, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Create issue error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
