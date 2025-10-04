'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Config {
  _id?: string;
  slaThresholds: {
    high: number;
    medium: number;
    low: number;
  };
  emailSettings: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpFrom: string;
  };
  systemSettings: {
    maintenanceMode: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  updatedAt?: string;
}

export default function SystemSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<Config>({
    slaThresholds: {
      high: 4, // hours
      medium: 24, // hours
      low: 72 // hours
    },
    emailSettings: {
      enabled: true,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpFrom: ''
    },
    systemSettings: {
      maintenanceMode: false,
      maxFileSize: 5, // MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif']
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'SuperAdmin') {
      router.push('/login');
      return;
    }
    fetchConfig();
  }, [session, status, router]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        // Ensure all required properties exist with fallbacks
        setConfig({
          slaThresholds: data.slaThresholds || { high: 4, medium: 24, low: 72 },
          emailSettings: {
            enabled: data.emailSettings?.enabled ?? true,
            smtpHost: data.emailSettings?.smtpHost || '',
            smtpPort: data.emailSettings?.smtpPort || 587,
            smtpUser: data.emailSettings?.smtpUser || '',
            smtpFrom: data.emailSettings?.smtpFrom || ''
          },
          systemSettings: {
            maintenanceMode: data.systemSettings?.maintenanceMode ?? false,
            maxFileSize: data.systemSettings?.maxFileSize || 5,
            allowedFileTypes: data.systemSettings?.allowedFileTypes || ['jpg', 'jpeg', 'png', 'gif']
          },
          _id: data._id,
          updatedAt: data.updatedAt
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Test email sent successfully!');
      } else {
        alert('Error sending test email');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      alert('Error testing email');
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* SLA Thresholds */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">SLA Thresholds (Hours)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">High Priority</label>
              <Input
                type="number"
                value={config.slaThresholds?.high || 0}
                onChange={(e) => setConfig({
                  ...config,
                  slaThresholds: {
                    ...config.slaThresholds,
                    high: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Medium Priority</label>
              <Input
                type="number"
                value={config.slaThresholds?.medium || 0}
                onChange={(e) => setConfig({
                  ...config,
                  slaThresholds: {
                    ...config.slaThresholds,
                    medium: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Priority</label>
              <Input
                type="number"
                value={config.slaThresholds?.low || 0}
                onChange={(e) => setConfig({
                  ...config,
                  slaThresholds: {
                    ...config.slaThresholds,
                    low: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Email Settings</h2>
            <Button onClick={testEmail} variant="outline">
              Test Email
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={config.emailSettings?.enabled || false}
                onChange={(e) => setConfig({
                  ...config,
                  emailSettings: {
                    ...config.emailSettings,
                    enabled: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <label htmlFor="emailEnabled" className="text-sm font-medium">
                Enable Email Notifications
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Host</label>
              <Input
                value={config.emailSettings?.smtpHost || ''}
                onChange={(e) => setConfig({
                  ...config,
                  emailSettings: {
                    ...config.emailSettings,
                    smtpHost: e.target.value
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Port</label>
              <Input
                type="number"
                value={config.emailSettings?.smtpPort || 587}
                onChange={(e) => setConfig({
                  ...config,
                  emailSettings: {
                    ...config.emailSettings,
                    smtpPort: parseInt(e.target.value) || 587
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP User</label>
              <Input
                value={config.emailSettings?.smtpUser || ''}
                onChange={(e) => setConfig({
                  ...config,
                  emailSettings: {
                    ...config.emailSettings,
                    smtpUser: e.target.value
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">From Email</label>
              <Input
                value={config.emailSettings?.smtpFrom || ''}
                onChange={(e) => setConfig({
                  ...config,
                  emailSettings: {
                    ...config.emailSettings,
                    smtpFrom: e.target.value
                  }
                })}
              />
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={config.systemSettings?.maintenanceMode || false}
                onChange={(e) => setConfig({
                  ...config,
                  systemSettings: {
                    ...config.systemSettings,
                    maintenanceMode: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium">
                Maintenance Mode
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max File Size (MB)</label>
              <Input
                type="number"
                value={config.systemSettings?.maxFileSize || 5}
                onChange={(e) => setConfig({
                  ...config,
                  systemSettings: {
                    ...config.systemSettings,
                    maxFileSize: parseInt(e.target.value) || 5
                  }
                })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Allowed File Types</label>
              <Input
                value={config.systemSettings?.allowedFileTypes?.join(', ') || 'jpg, jpeg, png, gif'}
                onChange={(e) => setConfig({
                  ...config,
                  systemSettings: {
                    ...config.systemSettings,
                    allowedFileTypes: e.target.value.split(',').map(s => s.trim())
                  }
                })}
                placeholder="jpg, jpeg, png, gif"
              />
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Service</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">File Upload</span>
              <Badge className="bg-green-100 text-green-800">Working</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Uptime</span>
              <Badge className="bg-blue-100 text-blue-800">99.9%</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
