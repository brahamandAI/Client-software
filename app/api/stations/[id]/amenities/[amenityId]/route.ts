import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import StationAmenity from '@/models/StationAmenity';
import { z } from 'zod';

const updateAmenitySchema = z.object({
  amenityTypeId: z.string().optional(),
  locationDescription: z.string().optional(),
  status: z.enum(['ok', 'needs_maintenance', 'out_of_service']).optional(),
  notes: z.string().optional(),
});

export async function GET(
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

    await connectDB();

    const amenity = await StationAmenity.findById(params.amenityId)
      .populate('amenityTypeId');

    if (!amenity) {
      return NextResponse.json(
        { error: 'Amenity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Get amenity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Only SuperAdmin and StationManager can update amenities
    if (!['SuperAdmin', 'StationManager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin and StationManager can update amenities' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateAmenitySchema.parse(body);

    await connectDB();

    const amenity = await StationAmenity.findByIdAndUpdate(
      params.amenityId,
      validatedData,
      { new: true }
    ).populate('amenityTypeId');

    if (!amenity) {
      return NextResponse.json(
        { error: 'Amenity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Update amenity error:', error);
    
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

export async function DELETE(
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

    // Only SuperAdmin and StationManager can delete amenities
    if (!['SuperAdmin', 'StationManager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin and StationManager can delete amenities' },
        { status: 403 }
      );
    }

    // If user is StationManager, verify they can only delete amenities from their station
    if (session.user.role === 'StationManager' && session.user.stationId !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete amenities from your station' },
        { status: 403 }
      );
    }

    await connectDB();

    const amenity = await StationAmenity.findByIdAndDelete(params.amenityId);

    if (!amenity) {
      return NextResponse.json(
        { error: 'Amenity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete amenity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
