import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if API key is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not set in environment variables' },
        { status: 503 }
      );
    }

    // Test API key with OpenAI
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'OpenAI API key test failed',
          status: response.status,
          details: errorData
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API key is working correctly',
      models: data.data?.length || 0,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });

  } catch (error) {
    console.error('AI test error:', error);
    return NextResponse.json(
      { error: 'Failed to test AI configuration' },
      { status: 500 }
    );
  }
}
