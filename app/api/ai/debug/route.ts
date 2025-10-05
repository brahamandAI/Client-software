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

    const body = await request.json();
    const { imageBase64, amenityType } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug: Starting AI analysis...');
    console.log('Image size:', imageBase64.length);
    console.log('Amenity type:', amenityType);

    // Analyze photo
    const analysis = await aiService.analyzePhoto(imageBase64, amenityType || 'General');

    console.log('✅ Debug: AI analysis completed');
    console.log('Analysis result:', analysis);

    return NextResponse.json({
      analysis,
      success: true,
      debug: {
        imageSize: imageBase64.length,
        amenityType: amenityType || 'General',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Debug: AI analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: errorName
    });
    return NextResponse.json(
      { 
        error: 'Failed to analyze photo',
        details: errorMessage,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: errorName
        }
      },
      { status: 500 }
    );
  }
}
