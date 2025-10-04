import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Issue from '@/models/Issue';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['reported', 'acknowledged', 'assigned', 'resolved', 'closed']),
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

    // Only SuperAdmin, StationManager, and Staff can update issue status
    if (!['SuperAdmin', 'StationManager', 'Staff'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Only staff can update issue status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    await connectDB();

    const updateData: any = { status };
    
    // Set resolvedAt when status is resolved
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const issue = await Issue.findByIdAndUpdate(
      params.id,
      updateData,
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
    console.error('Update issue status error:', error);
    
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
