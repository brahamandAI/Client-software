import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import Inspection from '@/models/Inspection';
import StationAmenity from '@/models/StationAmenity';
import { z } from 'zod';

const createInspectionSchema = z.object({
  stationAmenityId: z.string().min(1, 'Station amenity ID is required'),
  status: z.enum(['ok', 'needs_maintenance', 'out_of_service']),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional().default([]),
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

    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const query: any = {};

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // If user is not SuperAdmin, filter by their station
    if (user.role !== 'SuperAdmin' && user.stationId) {
      query.stationId = user.stationId;
    }

    const inspections = await Inspection.find(query)
      .populate({
        path: 'stationAmenityId',
        populate: {
          path: 'stationId',
          select: 'name code'
        }
      })
      .populate({
        path: 'stationAmenityId',
        populate: {
          path: 'amenityTypeId',
          select: 'key label'
        }
      })
      .populate('staffId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(inspections, { headers: corsHeaders });
  } catch (error) {
    console.error('Get inspections error:', error);
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

    // Only Staff and above can create inspections
    if (!['SuperAdmin', 'StationManager', 'Staff'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Only staff can create inspections' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { stationAmenityId, status, notes, photos } = createInspectionSchema.parse(body);

    await connectDB();

    // Verify station amenity exists
    const stationAmenity = await StationAmenity.findById(stationAmenityId);
    if (!stationAmenity) {
      return NextResponse.json(
        { error: 'Station amenity not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if user has access to this station amenity
    if (user.role !== 'SuperAdmin' && 
        stationAmenity.stationId.toString() !== user.stationId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only inspect amenities in your assigned station' },
        { status: 403, headers: corsHeaders }
      );
    }

    const inspection = await Inspection.create({
      stationAmenityId,
      staffId: user.id,
      status,
      notes,
      photos: photos || [],
    });

    // Update the station amenity with the latest inspection
    await StationAmenity.findByIdAndUpdate(stationAmenityId, {
      status,
      lastInspectedAt: new Date(),
      notes: notes || stationAmenity.notes,
    });

    await inspection.populate([
      {
        path: 'stationAmenityId',
        populate: [
          { path: 'stationId', select: 'name code' },
          { path: 'amenityTypeId', select: 'key label' }
        ]
      },
      { path: 'staffId', select: 'name email' }
    ]);

    return NextResponse.json(inspection, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Create inspection error:', error);
    
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
