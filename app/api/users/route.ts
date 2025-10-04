import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Station from '@/models/Station';
import { z } from 'zod';

// Ensure all models are registered
import '@/lib/models';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SuperAdmin', 'StationManager', 'Staff', 'Public']),
  stationId: z.string().optional(),
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

    // Only SuperAdmin can view all users
    if (user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can view users' },
        { status: 403, headers: corsHeaders }
      );
    }

    await connectDB();

    const users = await User.find({})
      .populate('stationId', 'name code')
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return NextResponse.json(users, { headers: corsHeaders });
  } catch (error) {
    console.error('Get users error:', error);
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

    // Only SuperAdmin can create users
    if (user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can create users' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { name, email, password, role, stationId } = createUserSchema.parse(body);

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      stationId: stationId || undefined,
    });

    await newUser.populate('stationId', 'name code');

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Create user error:', error);
    
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
