require('dotenv').config({ path: '.env.local' });

async function testAISimple() {
  console.log('🤖 Testing AI Service Simple...\n');

  try {
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`Length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}\n`);

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found in environment variables');
      return;
    }

    // Test OpenAI API directly
    console.log('🔍 Testing OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test. Please respond with: {"status": "working", "message": "AI is working correctly"}'
          }
        ],
        max_tokens: 100
      })
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.error('❌ OpenAI API Error:');
      console.error(errorData);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testAISimple();
