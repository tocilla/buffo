import { ThemeProvider } from '@/components/home/theme-provider';
import { siteConfig } from '@/lib/site';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: 'black',
};

// Helper function to get user config based on username
async function getUserConfig(username?: string) {
  const defaultConfig = {
    branding: {
      name: 'Buffo',
      description: 'Buffo is a fully open source AI assistant that helps you accomplish real-world tasks with ease. Through natural conversation, Buffo becomes your digital companion for research, data analysis, and everyday challenges.',
      logo: '/buffo-logo.svg'
    },
    contact: {
      url: 'https://buffo.so',
      twitter: '@buffoai'
    }
  };

  if (!username) return defaultConfig;

  try {
    // Use relative URL to avoid middleware authentication issues
    const response = await fetch(`/${username}-config.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error loading user config:', error);
  }

  return defaultConfig;
}

// Generate metadata dynamically based on user
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const username = cookieStore.get('basic-auth-user')?.value;
  const config = await getUserConfig(username);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: config.branding.name,
      template: `%s - ${config.branding.name}`,
    },
    description: config.branding.description,
    keywords: [
      'AI',
      'artificial intelligence',
      'browser automation',
      'web scraping',
      'file management',
      'AI assistant',
      'open source',
      'research',
      'data analysis',
    ],
    authors: [{ name: 'Buffo Team', url: config.contact.url }],
    creator: 'Buffo Team',
    publisher: 'Buffo Team',
    category: 'Technology',
    applicationName: config.branding.name,
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: `${config.branding.name} - Open Source Generalist AI Agent`,
      description: config.branding.description,
      url: siteConfig.url,
      siteName: config.branding.name,
      images: [
        {
          url: '/banner.png',
          width: 1200,
          height: 630,
          alt: `${config.branding.name} - Open Source Generalist AI Agent`,
          type: 'image/png',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.branding.name} - Open Source Generalist AI Agent`,
      description: config.branding.description,
      creator: config.contact.twitter,
      site: config.contact.twitter,
      images: [
        {
          url: '/banner.png',
          width: 1200,
          height: 630,
          alt: `${config.branding.name} - Open Source Generalist AI Agent`,
        },
      ],
    },
    icons: {
      icon: [{ url: '/favicon.png', sizes: 'any' }],
      shortcut: '/favicon.png',
    },
    // manifest: "/manifest.json",
    alternates: {
      canonical: siteConfig.url,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PCHSN4M2');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PCHSN4M2"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
          <Analytics />
          <GoogleAnalytics gaId="G-6ETJFB3PT3" />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
