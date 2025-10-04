'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPinIcon, 
  WrenchScrewdriverIcon, 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      // Redirect authenticated users to their dashboard
      switch (session.user.role) {
        case 'SuperAdmin':
          router.push('/admin');
          break;
        case 'StationManager':
        case 'Staff':
          router.push('/manager');
          break;
        default:
          // Public users stay on this page
          break;
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-cream to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-railway-orange to-railway-red shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {/* Train Icon */}
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5h1.5L9 19h6l1.5 1.5H18L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9.5zM6 6h12v9.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V6z"/>
                  <circle cx="8.5" cy="12.5" r="1.5"/>
                  <circle cx="15.5" cy="12.5" r="1.5"/>
                  <path d="M7 8h10v2H7V8z"/>
                  <path d="M7 11h10v1H7v-1z"/>
                </svg>
                Railway Passenger Amenities
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-white/90">
                    Welcome, {session.user.name}
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {session.user.role}
                  </Badge>
                  <Button
                    onClick={() => router.push('/api/auth/signout')}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-railway-orange"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-railway-orange"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-railway-orange to-railway-red bg-clip-text text-transparent sm:text-5xl">
            Railway Station Amenities Management
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Comprehensive system for managing passenger amenities, inspections, and issue tracking
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <MapPinIcon className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Station Management</CardTitle>
              <CardDescription>
                Manage multiple railway stations with their amenities and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Station registration and updates</li>
                <li>• Geographic location tracking</li>
                <li>• Regional organization</li>
                <li>• Amenity configuration</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <WrenchScrewdriverIcon className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Amenity Management</CardTitle>
              <CardDescription>
                Track and manage various passenger amenities across stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Water booths and toilets</li>
                <li>• Seating and lighting</li>
                <li>• Fans and dustbins</li>
                <li>• Status monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Inspections</CardTitle>
              <CardDescription>
                Daily inspection system for staff to monitor amenity conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Photo documentation</li>
                <li>• Status reporting</li>
                <li>• Notes and observations</li>
                <li>• Historical tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Issue Tracking</CardTitle>
              <CardDescription>
                Comprehensive issue reporting and resolution workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Priority-based reporting</li>
                <li>• Assignment workflow</li>
                <li>• Email notifications</li>
                <li>• Resolution tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ChartBarIcon className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>MIS Reports</CardTitle>
              <CardDescription>
                Generate comprehensive reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Uptime metrics</li>
                <li>• Resolution times</li>
                <li>• Issue statistics</li>
                <li>• Performance dashboards</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <UserGroupIcon className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure access control with different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• SuperAdmin: Full access</li>
                <li>• StationManager: Station control</li>
                <li>• Staff: Operations</li>
                <li>• Public: Read-only</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-railway-orange to-railway-red text-white rounded-lg p-8 text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Sign in to access the full system or contact your administrator for access
          </p>
          {!session && (
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-railway-orange"
              onClick={() => router.push('/login')}
            >
              Sign In Now
            </Button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-railway-navy to-railway-darkNavy text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 Indian Railways - Passenger Amenities Management System. All rights reserved.</p>
            <p className="text-white/70 text-sm mt-2">Secure • Reliable • Efficient</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
