'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useUserConfig } from '@/contexts/UserConfigContext';

export function KortixLogo() {
  const { theme } = useTheme();
  const { config, loading } = useUserConfig();
  const [mounted, setMounted] = useState(false);

  // After mount, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="flex h-6 w-6 items-center justify-center flex-shrink-0">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center flex-shrink-0">
      <Image
        src={config.branding.logo}
        alt={config.branding.name}
        width={24}
        height={24}
        className={`${mounted && theme === 'dark' ? 'invert' : ''}`}
      />
    </div>
  );
}
