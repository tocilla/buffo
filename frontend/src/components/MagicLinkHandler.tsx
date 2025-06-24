'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function MagicLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleMagicLinkTokens = async () => {
      // Check if we have tokens in the URL fragment
      const hash = window.location.hash;

      if (hash && hash.includes('access_token=')) {
        console.log('🔗 Magic link tokens detected in URL fragment');

        try {
          const supabase = createClient();

          // Extract tokens from URL fragment
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            console.log('🔄 Setting session from magic link tokens');

            // Set the session using the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('❌ Error setting session:', error);
              return;
            }

            if (data.session) {
              console.log('✅ Session established successfully');

              // Clean up the URL by removing the fragment
              const cleanUrl = window.location.pathname + window.location.search;
              window.history.replaceState({}, '', cleanUrl);

              // Redirect to dashboard
              router.push('/dashboard');
            }
          }
        } catch (error) {
          console.error('❌ Error processing magic link:', error);
        }
      }
    };

    // Run immediately
    handleMagicLinkTokens();
  }, [router]);

  return null; // This component doesn't render anything
}