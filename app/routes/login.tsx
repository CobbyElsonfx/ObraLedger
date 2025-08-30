import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle } from "lucide-react";
import { authService, type LoginCredentials } from "../../lib/auth";
import { databaseHelpers } from "../../lib/database";

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      // Don't redirect, let the parent component handle it
      return;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

         try {
       const user = await authService.login(credentials);
       console.log('Login result:', user);
                     if (user) {
         setSuccess('Login successful!');
         console.log('User logged in, auth state should update');
         // Force a re-render by triggering a state update
         setTimeout(() => {
           setSuccess('');
           // Force check authentication state
           const isAuth = authService.isAuthenticated();
           console.log('Current auth state:', isAuth);
         }, 1000);
       } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleDemoLogin = async () => {
    setCredentials({
      email: 'admin@obraledger.com',
      password: 'admin123'
    });
    
    // Auto-submit after setting demo credentials
    setTimeout(async () => {
      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const user = await authService.login({
          email: 'admin@obraledger.com',
          password: 'admin123'
        });
                 if (user) {
           setSuccess('Demo login successful!');
           // Give the auth state time to update
           setTimeout(() => {
             setSuccess('');
           }, 2000);
         }
      } catch (err) {
        setError('Demo login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Obra Ledger</h1>
          <p className="text-gray-600 mt-2">Funeral Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your funeral management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={handleInputChange('email')}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleInputChange('password')}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

                             {/* Demo Login Button */}
               <Button
                 type="button"
                 variant="outline"
                 className="w-full"
                 onClick={handleDemoLogin}
                 disabled={isLoading}
               >
                 Try Demo Login (Admin)
               </Button>

                               {/* Test Button - Remove in production */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      await databaseHelpers.clearAllData();
                      await authService.initialize();
                      alert('Database cleared and default admin user created!');
                    } catch (error) {
                      alert('Error: ' + error);
                    }
                  }}
                  disabled={isLoading}
                >
                  Reset Database (Test)
                </Button>

                {/* Debug Button - Remove in production */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const isAuth = authService.isAuthenticated();
                    const currentUser = authService.getCurrentUser();
                    console.log('Debug - Is authenticated:', isAuth);
                    console.log('Debug - Current user:', currentUser);
                    alert(`Auth: ${isAuth}, User: ${currentUser ? currentUser.name : 'None'}`);
                  }}
                  disabled={isLoading}
                >
                  Debug Auth State
                </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Email:</strong> admin@obraledger.com</p>
                <p><strong>Password:</strong> admin123</p>
                <p><strong>Role:</strong> Administrator (Full Access)</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This is an offline-first application. All data is stored locally.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
