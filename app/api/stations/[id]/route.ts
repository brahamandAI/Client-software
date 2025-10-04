import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Station from '@/models/Station';

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

    const station = await Station.findById(params.id);

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(station);
  } catch (error) {
    console.error('Get station error:', error);
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

    // Only SuperAdmin can update stations
    if (session.user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can update stations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, region, address, geoLat, geoLng } = body;

    await connectDB();

    const station = await Station.findByIdAndUpdate(
      params.id,
      { name, code, region, address, geoLat, geoLng },
      { new: true }
    );

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(station);
  } catch (error) {
    console.error('Update station error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only SuperAdmin can delete stations
    if (session.user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can delete stations' },
        { status: 403 }
      );
    }

    await connectDB();

    const station = await Station.findByIdAndDelete(params.id);

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Delete station error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
