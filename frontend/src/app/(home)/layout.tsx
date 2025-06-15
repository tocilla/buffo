'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

// Commented out navbar since home page is disabled
// import { Navbar } from '@/components/home/sections/navbar';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Immediate redirect since home page is disabled
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth');
      }
    }
  }, [user, isLoading, router]);

  // Don't render the full layout since we're redirecting
  return (
    <div className="w-full relative">
      {children}
    </div>
  );

  // Original home layout - commented out since home page is disabled
  /*
  return (
    <div className="w-full relative">
      <div className="block w-px h-full border-l border-border fixed top-0 left-6 z-10"></div>
      <div className="block w-px h-full border-r border-border fixed top-0 right-6 z-10"></div>
      <Navbar />
      {children}
    </div>
  );
  */
}
