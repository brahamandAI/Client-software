'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function TestPage() {
  const { data: session } = useSession();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      setTestResults({ endpoint, method, status: response.status, data });
      toast.success(`API test completed: ${endpoint}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`API test failed: ${endpoint}`);
      setTestResults({ endpoint, method, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const testFileUpload = async () => {
    setLoading(true);
    try {
      // Create a test file
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx!.fillStyle = 'red';
      ctx!.fillRect(0, 0, 100, 100);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('files', blob!, 'test.jpg');

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        setTestResults({ 
          endpoint: '/api/media/upload', 
          method: 'POST', 
          status: response.status, 
          data 
        });
        toast.success('File upload test completed');
        setLoading(false);
      }, 'image/jpeg');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('File upload test failed');
      setTestResults({ endpoint: '/api/media/upload', method: 'POST', error: errorMessage });
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Test Page</CardTitle>
            <CardDescription>Please sign in to access the test page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Test Page</CardTitle>
            <CardDescription>
              Test various API endpoints and functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => testAPI('/api/auth/me')}
                disabled={loading}
              >
                Test Auth Me
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/stations')}
                disabled={loading}
              >
                Test Get Stations
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/issues')}
                disabled={loading}
              >
                Test Get Issues
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/reports/mis?period=daily')}
                disabled={loading}
              >
                Test MIS Report
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/config')}
                disabled={loading}
              >
                Test Get Config
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/health')}
                disabled={loading}
              >
                Health Check
              </Button>
              
              <Button 
                onClick={testFileUpload}
                disabled={loading}
              >
                Test File Upload
              </Button>
              
              {session.user.role === 'SuperAdmin' && (
                <Button 
                  onClick={() => testAPI('/api/alerts/run-now', 'POST')}
                  disabled={loading}
                >
                  Test Run Alerts
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Endpoint:</strong> {testResults.endpoint}</p>
                <p><strong>Method:</strong> {testResults.method}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    testResults.status >= 200 && testResults.status < 300 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults.status}
                  </span>
                </p>
                {testResults.error && (
                  <p><strong>Error:</strong> <span className="text-red-600">{testResults.error}</span></p>
                )}
                <div className="mt-4">
                  <strong>Response Data:</strong>
                  <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto max-h-96">
                    {JSON.stringify(testResults.data, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
