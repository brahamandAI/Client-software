import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Ensure all models are registered
import '@/lib/models';

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['SuperAdmin', 'StationManager', 'Staff', 'Public']).optional(),
  stationId: z.string().optional(),
  isActive: z.boolean().optional(),
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

// GET single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Only SuperAdmin can view user details
    if (user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can view user details' },
        { status: 403, headers: corsHeaders }
      );
    }

    await connectDB();

    const targetUser = await User.findById(params.id)
      .populate('stationId', 'name code')
      .select('-passwordHash');

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(targetUser, { headers: corsHeaders });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Only SuperAdmin can update users
    if (user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can update users' },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    await connectDB();

    // Find the user to update
    const targetUser = await User.findById(params.id);
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if email is being changed and if it already exists
    if (validatedData.email && validatedData.email !== targetUser.email) {
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400, headers: corsHeaders }
        );
      }
      targetUser.email = validatedData.email;
    }

    // Update fields
    if (validatedData.name) targetUser.name = validatedData.name;
    if (validatedData.role) targetUser.role = validatedData.role;
    if (validatedData.stationId !== undefined) {
      targetUser.stationId = validatedData.stationId || undefined;
    }
    if (validatedData.isActive !== undefined) {
      // @ts-ignore - isActive might not be in schema yet
      targetUser.isActive = validatedData.isActive;
    }

    // Update password if provided
    if (validatedData.password) {
      const passwordHash = await bcrypt.hash(validatedData.password, 12);
      targetUser.passwordHash = passwordHash;
    }

    await targetUser.save();
    await targetUser.populate('stationId', 'name code');

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = targetUser.toObject();

    return NextResponse.json(userWithoutPassword, { headers: corsHeaders });
  } catch (error) {
    console.error('Update user error:', error);
    
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

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Only SuperAdmin can delete users
    if (user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can delete users' },
        { status: 403, headers: corsHeaders }
      );
    }

    await connectDB();

    // Prevent deleting yourself
    if (params.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400, headers: corsHeaders }
      );
    }

    const targetUser = await User.findById(params.id);
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    await User.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

