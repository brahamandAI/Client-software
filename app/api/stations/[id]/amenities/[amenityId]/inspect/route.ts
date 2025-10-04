import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import StationAmenity from '@/models/StationAmenity';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; amenityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only StationManager can inspect amenities
    if (session.user.role !== 'StationManager') {
      return NextResponse.json(
        { error: 'Forbidden - Only StationManager can inspect amenities' },
        { status: 403 }
      );
    }

    const stationId = params.id;
    const amenityId = params.amenityId;

    // Verify the amenity belongs to the manager's station
    if (session.user.stationId !== stationId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only inspect amenities in your station' },
        { status: 403 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;
    const photos = formData.getAll('photos') as File[];

    // Validate status
    if (!['ok', 'needs_maintenance', 'out_of_service'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Process photos
    const photoUrls: string[] = [];
    
    if (photos && photos.length > 0) {
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

    // Update amenity with inspection data
    const amenity = await StationAmenity.findByIdAndUpdate(
      amenityId,
      {
        status,
        notes,
        lastInspectedAt: new Date(),
        $push: { photos: { $each: photoUrls } }
      },
      { new: true }
    );

    if (!amenity) {
      return NextResponse.json(
        { error: 'Amenity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      amenity
    });
  } catch (error) {
    console.error('Inspect amenity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
