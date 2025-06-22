'use client';

import { useEffect } from 'react';
import { useUserConfig } from '@/contexts/UserConfigContext';

export function DynamicTitle() {
  const { config, loading } = useUserConfig();

  useEffect(() => {
    if (!loading) {
      document.title = config.app.title;
    }
  }, [config.app.title, loading]);

  return null;
}