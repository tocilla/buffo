'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface UserConfig {
  user: string;
  branding: {
    name: string;
    description: string;
    logo: string;
    fullLogo?: string;
    favicon: string;
    primaryColor: string;
    accentColor: string;
  };
  app: {
    title: string;
    welcomeMessage: string;
    placeholderText: string;
    cta: string;
    url: string;
  };
  contact: {
    email: string;
    twitter: string;
    discord: string;
    github: string;
  };
}

// Default configuration (fallback)
const defaultConfig: UserConfig = {
  user: 'default',
  branding: {
    name: 'Buffo AI',
    description: 'The AI Assistant that acts on your behalf.',
    logo: '/buffo-symbol.svg',
    fullLogo: '/buffo-logo.svg',
    favicon: '/favicon.ico',
    primaryColor: '#3b82f6',
    accentColor: '#1d4ed8'
  },
  app: {
    title: 'Buffo AI Dashboard',
    welcomeMessage: 'What would you like Buffo AI to do today?',
    placeholderText: 'Ask Buffo AI to...',
    cta: 'Start with Buffo',
    url: 'http://157.180.8.150:3000'
  },
  contact: {
    email: 'support@buffo.ai',
    twitter: 'https://x.com/buffoai',
    discord: 'https://discord.gg/buffoai',
    github: 'https://github.com/buffo-ai/buffo'
  }
};

interface UserConfigContextType {
  config: UserConfig;
  loading: boolean;
}

const UserConfigContext = createContext<UserConfigContextType>({
  config: defaultConfig,
  loading: true,
});

export const useUserConfig = () => {
  const context = useContext(UserConfigContext);
  if (!context) {
    throw new Error('useUserConfig must be used within a UserConfigProvider');
  }
  return context;
};

interface UserConfigProviderProps {
  children: ReactNode;
}

export const UserConfigProvider: React.FC<UserConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<UserConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const loadUserConfig = async () => {
      try {
        // Get the current user from the server-side cookie
        const response = await fetch('/api/user-config');
        if (response.ok) {
          const userData = await response.json();
          const username = userData.username;

          if (username) {
            // Load the appropriate config file
            console.log(`Loading config for user: ${username}`);
            // Handle both client-side and server-side contexts
            const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
            const configResponse = await fetch(`${baseUrl}/${username}-config.json`);
            console.log(`Config response status: ${configResponse.status}`);

            if (configResponse.ok) {
              const contentType = configResponse.headers.get('content-type');
              console.log(`Config response content-type: ${contentType}`);

              try {
                const userConfig = await configResponse.json();
                console.log(`Successfully loaded config for ${username}:`, userConfig);
                setConfig(userConfig);
              } catch (jsonError) {
                console.error(`Failed to parse JSON for ${username}:`, jsonError);
                console.warn(`Using default config for ${username}`);
              }
            } else {
              console.warn(`Config file for ${username} not found (${configResponse.status}), using default config`);
            }
          } else {
            console.warn('No username found, using default config');
          }
        } else {
          console.warn('Failed to get user info from API, using default config');
        }
      } catch (error) {
        console.error('Failed to load user config:', error);
        // Keep default config on error
      } finally {
        setLoading(false);
      }
    };

    loadUserConfig();
  }, []);

  return (
    <UserConfigContext.Provider value={{ config, loading }}>
      {children}
    </UserConfigContext.Provider>
  );
};