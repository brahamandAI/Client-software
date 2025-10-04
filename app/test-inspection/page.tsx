'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TestInspectionPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testInspectionSubmission = async () => {
    setLoading(true);
    setResult('Testing inspection submission...\n');
    
    try {
      // Test data - using a sample amenity ID
      const testData = {
        stationAmenityId: '68ce2eed51ba8127c893512c', // The amenity ID from your test
        status: 'ok',
        notes: 'Test inspection from test page',
        photos: []
      };

      setResult(prev => prev + `Sending data: ${JSON.stringify(testData, null, 2)}\n`);

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      setResult(prev => prev + `Response status: ${response.status}\n`);

      if (response.ok) {
        const data = await response.json();
        setResult(prev => prev + `✅ Success! Inspection created:\n${JSON.stringify(data, null, 2)}\n`);
      } else {
        const errorData = await response.json();
        setResult(prev => prev + `❌ Error: ${JSON.stringify(errorData, null, 2)}\n`);
      }
    } catch (error) {
      setResult(prev => prev + `❌ Exception: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Inspection API</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Inspection Submission</h2>
        <p className="text-gray-600 mb-4">
          This will test the inspection API with the amenity ID from your test: 68ce2eed51ba8127c893512c
        </p>
        <Button 
          onClick={testInspectionSubmission} 
          disabled={loading}
          className="mb-4"
        >
          {loading ? 'Testing...' : 'Test Inspection Submission'}
        </Button>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap">{result || 'Click the button to test...'}</pre>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">What This Tests:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>API endpoint accessibility</li>
          <li>Data validation (Zod schema)</li>
          <li>Database connection</li>
          <li>Inspection creation</li>
          <li>Station amenity update</li>
          <li>Response formatting</li>
        </ul>
      </Card>
    </div>
  );
}
