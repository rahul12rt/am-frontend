"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import User from '@/components/molecules/user/User';
import { ArrowLeft, Home } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing } = useUser();
  const [redirectUrl, setRedirectUrl] = useState<string>('/');

  useEffect(() => {
    // Get redirect URL from query params
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already authenticated
    if (!isInitializing && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isInitializing, router, redirectUrl]);

  const handleLoginSuccess = () => {
    // Redirect to the intended page after successful login
    router.push(redirectUrl);
  };

  const handleBackClick = () => {
    router.back();
  };

  // Show loading while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Hero Image (70%) */}
      <div className="hidden lg:flex lg:w-[70%] relative overflow-hidden">
        <Image
          src="/images/login_page_image.jpg"
          alt="Alban Marcus Watches"
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay with branding */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-8">
          {/* Top - Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-white text-2xl font-bold tracking-[10px]">
              ALBAN MARCUS
            </Link>
          </div>
          
          {/* Bottom - Tagline */}
          <div className="text-white">
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Timeless Elegance
            </h1>
            <p className="text-xl xl:text-2xl text-gray-200 leading-relaxed">
              Discover our collection of premium timepieces crafted for the modern connoisseur
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (30%) */}
      <div className="w-full lg:w-[30%] flex flex-col relative">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Mobile Logo (visible only on mobile) */}
        <div className="lg:hidden p-6 text-center border-b border-gray-800">
          <Link href="/" className="text-white text-xl font-bold tracking-[8px]">
            ALBAN MARCUS
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Welcome Message */}
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-[3.6rem] font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-400 text-[1.6rem]">
                  Sign in to access your account and continue shopping
                </p>
                {redirectUrl !== '/' && (
                  <p className="text-[1.4rem] text-blue-400 mt-2">
                    You'll be redirected after signing in
                  </p>
                )}
              </div>

              {/* User Component (Login/Register Forms) */}
              <User onClose={handleLoginSuccess} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 text-center">
          <p className="text-[1.4rem] text-gray-500">
            By continuing, you agree to our{' '}
            <Link href="/termsandconditions" className="text-white hover:underline">
              Terms & Conditions
            </Link>
            {' '}and{' '}
            <Link href="/privacypolicy" className="text-white hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
