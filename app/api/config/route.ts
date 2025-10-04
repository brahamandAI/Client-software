import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Config from '@/models/Config';
import { z } from 'zod';

const updateConfigSchema = z.object({
  slaThresholds: z.object({
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
  emailSettings: z.object({
    enabled: z.boolean(),
    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUser: z.string(),
    smtpFrom: z.string(),
  }),
  systemSettings: z.object({
    maintenanceMode: z.boolean(),
    maxFileSize: z.number(),
    allowedFileTypes: z.array(z.string()),
  }),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get or create default config
    let config = await Config.findOne({ key: 'system' });
    
    if (!config) {
      // Create default config
      config = new Config({
        key: 'system',
        value: {
          slaThresholds: {
            high: 4,
            medium: 24,
            low: 72
          },
          emailSettings: {
            enabled: true,
            smtpHost: process.env.SMTP_HOST || '',
            smtpPort: parseInt(process.env.SMTP_PORT || '587'),
            smtpUser: process.env.SMTP_USER || '',
            smtpFrom: process.env.SMTP_FROM || ''
          },
          systemSettings: {
            maintenanceMode: false,
            maxFileSize: 5,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif']
          }
        }
      });
      await config.save();
    }

    return NextResponse.json(config.value);
  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only SuperAdmin can update config
    if (session.user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Forbidden - Only SuperAdmin can update config' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateConfigSchema.parse(body);

    await connectDB();

    const config = await Config.findOneAndUpdate(
      { key: 'system' },
      { 
        key: 'system',
        value: validatedData,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, config: config.value });
  } catch (error) {
    console.error('Update config error:', error);
    
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

export async function POST(request: NextRequest) {
  // Redirect POST to PUT for config updates
  return PUT(request);
}
