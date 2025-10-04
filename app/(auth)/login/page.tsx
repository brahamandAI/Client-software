'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  UserGroupIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log('Login result:', result);

      if (result?.error) {
        console.log('Login error:', result.error);
        toast.error('Invalid credentials');
        return;
      }

      // Get session to check user role
      const session = await getSession();
      console.log('Session after login:', session);
      
      if (session?.user) {
        console.log('User role:', session.user.role);
        toast.success('Login successful');
        
        // Redirect based on role
        switch (session.user.role) {
          case 'SuperAdmin':
            router.push('/admin');
            break;
          case 'StationManager':
            router.push('/manager');
            break;
          case 'Staff':
            router.push('/staff');
            break;
          default:
            router.push('/');
        }
      } else {
        console.log('No session found after login');
        toast.error('Login failed - no session created');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/50 to-black/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20 animate-pulse">
                {/* Custom Train Icon */}
                <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5h1.5L9 19h6l1.5 1.5H18L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9.5zM6 6h12v9.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V6z"/>
                  <circle cx="8.5" cy="12.5" r="1.5"/>
                  <circle cx="15.5" cy="12.5" r="1.5"/>
                  <path d="M7 8h10v2H7V8z"/>
                  <path d="M7 11h10v1H7v-1z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Indian Railways
              </span>
            </h2>
            <h3 className="text-xl font-semibold text-white/90 mb-2">
              Passenger Amenities Management System
            </h3>
            <p className="text-white/80 text-sm">
              Secure access to station management system
            </p>
          </div>
          
          {/* Login Card */}
          <Card className="bg-white/95 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className="pl-4 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...register('password')}
                      className="pl-4 pr-12 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-orange-400/30"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Role Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h4 className="text-white font-semibold mb-4 text-center">System Access Levels</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-white/90">
                <CogIcon className="h-5 w-5 text-red-400" />
                <div>
                  <div className="font-medium">SuperAdmin</div>
                  <div className="text-xs text-white/70">Full system access</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <UserGroupIcon className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium">Station Manager</div>
                  <div className="text-xs text-white/70">Station management</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-medium">Staff</div>
                  <div className="text-xs text-white/70">Operations & inspections</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <EyeIcon className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="font-medium">Public</div>
                  <div className="text-xs text-white/70">Read-only access</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/80 text-sm">
              © 2024 Indian Railways - Passenger Amenities Management System
            </p>
            <p className="text-white/60 text-xs mt-1">
              Secure • Reliable • Efficient
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
