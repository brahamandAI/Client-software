require('dotenv').config({ path: '.env.local' });

async function testImageUpload() {
  console.log('📸 Testing Image Upload to AI API...\n');

  try {
    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    console.log('Test image size:', testImageBase64.length);
    console.log('Test image preview:', testImageBase64.substring(0, 50) + '...');

    const response = await fetch('http://localhost:3000/api/ai/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // This might not work without proper auth
      },
      body: JSON.stringify({
        imageBase64: testImageBase64,
        amenityType: 'Toilet'
      })
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);

    const responseText = await response.text();
    console.log('Response:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ AI Debug Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ AI Debug Error:');
      console.error(responseText);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testImageUpload();
