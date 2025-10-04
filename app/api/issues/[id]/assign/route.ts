import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { z } from 'zod';

const assignIssueSchema = z.object({
  assignedToId: z.string().min(1, 'Assigned to ID is required'),
});

export async function PATCH(
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

    // Only SuperAdmin, StationManager, and Staff can assign issues
    if (!['SuperAdmin', 'StationManager', 'Staff'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Only staff can assign issues' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignedToId } = assignIssueSchema.parse(body);

    await connectDB();

    // Verify assigned user exists and has appropriate role
    const assignedUser = await User.findById(assignedToId);
    if (!assignedUser || !['StationManager', 'Staff'].includes(assignedUser.role)) {
      return NextResponse.json(
        { error: 'Invalid assigned user' },
        { status: 400 }
      );
    }

    const issue = await Issue.findByIdAndUpdate(
      params.id,
      { 
        assignedToId,
        status: 'assigned'
      },
      { new: true }
    ).populate([
      { path: 'stationId', select: 'name code' },
      { path: 'stationAmenityId' },
      { path: 'reportedById', select: 'name email' },
      { path: 'assignedToId', select: 'name email' },
    ]);

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Assign issue error:', error);
    
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
