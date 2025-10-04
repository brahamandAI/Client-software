import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import StationAmenity from '@/models/StationAmenity';
import AmenityType from '@/models/AmenityType';
import { z } from 'zod';

const createAmenitySchema = z.object({
  amenityTypeKey: z.string().optional(),
  amenityTypeId: z.string().optional(),
  locationDescription: z.string().min(5, 'Location description must be at least 5 characters'),
}).refine(data => data.amenityTypeKey || data.amenityTypeId, {
  message: 'Either amenityTypeKey or amenityTypeId must be provided',
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

    const amenities = await StationAmenity.find({ stationId: params.id })
      .populate('amenityTypeId')
      .sort({ createdAt: -1 });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Get station amenities error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Only SuperAdmin and StationManager can add amenities
    if (!['SuperAdmin', 'StationManager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin and StationManager can add amenities' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amenityTypeKey, amenityTypeId, locationDescription } = createAmenitySchema.parse(body);

    await connectDB();

    let amenityType;
    if (amenityTypeKey) {
      amenityType = await AmenityType.findOne({ key: amenityTypeKey });
    } else if (amenityTypeId) {
      amenityType = await AmenityType.findById(amenityTypeId);
    }

    if (!amenityType) {
      return NextResponse.json(
        { error: 'Amenity type not found' },
        { status: 404 }
      );
    }

    const stationAmenity = await StationAmenity.create({
      stationId: params.id,
      amenityTypeId: amenityType._id,
      locationDescription,
    });

    await stationAmenity.populate('amenityTypeId');

    return NextResponse.json(stationAmenity, { status: 201 });
  } catch (error) {
    console.error('Create station amenity error:', error);
    
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
