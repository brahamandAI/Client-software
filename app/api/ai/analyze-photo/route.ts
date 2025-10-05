import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if AI service is configured
    if (!aiService.isConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const amenityType = formData.get('amenityType') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Analyze photo
    const analysis = await aiService.analyzePhoto(base64Image, amenityType || 'General');

    // Generate description
    const description = await aiService.generateDescription(analysis, amenityType || 'Unknown');

    return NextResponse.json({
      analysis,
      description,
      success: true
    });

  } catch (error) {
    console.error('AI photo analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to analyze photo',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

