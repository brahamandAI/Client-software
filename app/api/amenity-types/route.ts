import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AmenityType from '@/models/AmenityType';

export async function GET() {
  try {
    await connectDB();
    
    const amenityTypes = await AmenityType.find({});
    
    return NextResponse.json(amenityTypes);
  } catch (error) {
    console.error('Error fetching amenity types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch amenity types' },
      { status: 500 }
    );
  }
}
