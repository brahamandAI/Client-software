require('dotenv').config({ path: '.env.local' });

async function testAIDirect() {
  console.log('🤖 Testing AI Service Direct...\n');

  try {
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`Length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}\n`);

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found in environment variables');
      return;
    }

    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    console.log('Test image size:', testImageBase64.length);
    console.log('Test image preview:', testImageBase64.substring(0, 50) + '...\n');

    // Test OpenAI API directly with image
    console.log('🔍 Testing OpenAI API with image...');
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
            content: [
              {
                type: 'text',
                text: `Analyze this railway station toilet amenity photo and provide:
                1. Issue type (water leak, broken seat, lighting issue, clean/working, etc.)
                2. Severity level (low, medium, high)
                3. Detailed description of what you see
                4. Confidence level (0-100)
                5. Maintenance suggestions
                
                Respond in JSON format:
                {
                  "issueType": "string",
                  "severity": "low|medium|high",
                  "description": "string",
                  "confidence": number,
                  "suggestions": ["string1", "string2"]
                }`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${testImageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API Response:');
      console.log('Content:', data.choices[0].message.content);
      
      // Try to parse the JSON response
      try {
        const content = data.choices[0].message.content;
        let jsonContent = content;
        
        // Handle markdown code blocks
        if (content.includes('```json')) {
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            jsonContent = jsonMatch[1];
          }
        } else if (content.includes('```')) {
          const jsonMatch = content.match(/```\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            jsonContent = jsonMatch[1];
          }
        }
        
        const result = JSON.parse(jsonContent);
        console.log('✅ Parsed JSON Result:');
        console.log(JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.log('Raw content:', data.choices[0].message.content);
      }
    } else {
      const errorData = await response.text();
      console.error('❌ OpenAI API Error:');
      console.error(errorData);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testAIDirect();
