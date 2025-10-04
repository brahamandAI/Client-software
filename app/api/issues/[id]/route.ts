import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Issue from '@/models/Issue';
import { z } from 'zod';

// Ensure all models are registered
import '@/lib/models';

const updateIssueSchema = z.object({
  notes: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Import all required models
    const Station = (await import('@/models/Station')).default;
    const StationAmenity = (await import('@/models/StationAmenity')).default;
    const User = (await import('@/models/User')).default;

    const issue = await Issue.findById(params.id)
      .populate('stationId', 'name code')
      .populate('stationAmenityId', 'amenityTypeId locationDescription')
      .populate('stationAmenityId.amenityTypeId', 'name')
      .populate('reportedById', 'name email')
      .populate('assignedToId', 'name email');

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedIssue = {
      _id: issue._id.toString(),
      description: issue.description,
      priority: issue.priority,
      status: issue.status,
      reportedAt: issue.reportedAt,
      stationId: {
        _id: issue.stationId._id.toString(),
        name: issue.stationId.name,
        code: issue.stationId.code,
      },
      stationAmenityId: issue.stationAmenityId ? {
        _id: issue.stationAmenityId._id.toString(),
        amenityTypeId: {
          label: issue.stationAmenityId.amenityTypeId?.name || 'Unknown',
        },
        locationDescription: issue.stationAmenityId.locationDescription || 'Unknown',
      } : undefined,
      reportedById: {
        _id: issue.reportedById._id.toString(),
        name: issue.reportedById.name,
        email: issue.reportedById.email,
      },
      assignedToId: issue.assignedToId ? {
        _id: issue.assignedToId._id.toString(),
        name: issue.assignedToId.name,
        email: issue.assignedToId.email,
      } : undefined,
      photos: issue.photos || [],
      notes: issue.notes || '',
      resolvedAt: issue.resolvedAt,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };

    return NextResponse.json(transformedIssue);
  } catch (error) {
    console.error('Get issue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only SuperAdmin and StationManager can update issues
    if (!['SuperAdmin', 'StationManager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin and StationManager can update issues' },
        { status: 403 }
      );
    }

    await connectDB();

    // Import all required models
    const Station = (await import('@/models/Station')).default;
    const StationAmenity = (await import('@/models/StationAmenity')).default;
    const User = (await import('@/models/User')).default;

    const body = await request.json();
    const validatedData = updateIssueSchema.parse(body);

    const issue = await Issue.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true }
    ).populate('stationId', 'name code')
     .populate('stationAmenityId', 'amenityTypeId locationDescription')
     .populate('stationAmenityId.amenityTypeId', 'name')
     .populate('reportedById', 'name email')
     .populate('assignedToId', 'name email');

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedIssue = {
      _id: issue._id.toString(),
      description: issue.description,
      priority: issue.priority,
      status: issue.status,
      reportedAt: issue.reportedAt,
      stationId: {
        _id: issue.stationId._id.toString(),
        name: issue.stationId.name,
        code: issue.stationId.code,
      },
      stationAmenityId: issue.stationAmenityId ? {
        _id: issue.stationAmenityId._id.toString(),
        amenityTypeId: {
          label: issue.stationAmenityId.amenityTypeId?.name || 'Unknown',
        },
        locationDescription: issue.stationAmenityId.locationDescription || 'Unknown',
      } : undefined,
      reportedById: {
        _id: issue.reportedById._id.toString(),
        name: issue.reportedById.name,
        email: issue.reportedById.email,
      },
      assignedToId: issue.assignedToId ? {
        _id: issue.assignedToId._id.toString(),
        name: issue.assignedToId.name,
        email: issue.assignedToId.email,
      } : undefined,
      photos: issue.photos || [],
      notes: issue.notes || '',
      resolvedAt: issue.resolvedAt,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };

    return NextResponse.json(transformedIssue);
  } catch (error) {
    console.error('Update issue error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
