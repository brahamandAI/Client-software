import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import Station from '@/models/Station';
import { z } from 'zod';

const createStationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  region: z.string().min(2, 'Region must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  geoLat: z.number().min(-90).max(90),
  geoLng: z.number().min(-180).max(180),
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
    const region = searchParams.get('region');

    let query = {};
    if (region) {
      query = { region: { $regex: region, $options: 'i' } };
    }

    const stations = await Station.find(query).sort({ name: 1 });

    return NextResponse.json(stations, { headers: corsHeaders });
  } catch (error) {
    console.error('Get stations error:', error);
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

    // Only SuperAdmin can create stations
    if (user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can create stations' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { name, code, region, address, geoLat, geoLng } = createStationSchema.parse(body);

    await connectDB();

    // Check if station code already exists
    const existingStation = await Station.findOne({ code });
    if (existingStation) {
      return NextResponse.json(
        { error: 'Station with this code already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    const station = await Station.create({
      name,
      code,
      region,
      address,
      geoLat,
      geoLng,
    });

    return NextResponse.json(station, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Create station error:', error);
    
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
