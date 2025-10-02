import type { Metadata } from "next";
import localFont from "next/font/local";

import Header from "@/components/organisms/header/Header";
import "./globals.scss";
import Footer from "@/components/organisms/footer/Footer";
import { ToastProvider } from '@/contexts/ToastContext';
import { UserModalProvider } from '@/contexts/UserModalContext';
import UserModalWrapper from '@/components/organisms/user/UserModalWrapper';
import { Providers } from "./providers";
import ErrorBoundary from '@/components/ErrorBoundary';
import NavigationBoundary from '@/components/NavigationBoundary';
import CacheMonitor from '@/components/molecules/cacheMonitor/CacheMonitor';
import AppLoader from '@/components/layout/AppLoader';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';

const centurygothic = localFont({
  src: "../public/fonts/gothic/centurygothic.ttf",
});

const ppneuemontrealNormal = localFont({
  src: "../public/fonts/ppneuemontreal/ppneuemontreal-book.woff",
  variable: "--font-ppneuemontrealNormal",
});

const ppeditorialnewitalic = localFont({
  src: "../public/fonts/ppeditorialnew/ppeditorialnew-ultralightItalic.otf",
  variable: "--font-ppeditorialnewitalic",
});

const timesNewRomanNormal = localFont({
  src: "../public/fonts/timesNewRoman/times-new-roman.ttf",
  variable: "--font-timesNewRomanNormal",
});

export const metadata: Metadata = {
  title: {
    default: "Alban Marcus Watches - Luxury Mechanical Watches | Premium Swiss Movement Timepieces",
    template: "%s | Alban Marcus Watches"
  },
  description: "Discover Alban Marcus luxury mechanical watches crafted with precision. Premium Swiss movement timepieces, luxury watch collections, and exclusive mechanical watches for discerning collectors. Shop authentic luxury watches online.",
  keywords: [
    "Alban Marcus Watches",
    "luxury watches",
    "mechanical watches", 
    "Swiss movement watches",
    "premium timepieces",
    "luxury watch collection",
    "authentic watches",
    "mechanical timepieces",
    "watch collectors",
    "luxury watch brand",
    "Swiss made watches",
    "premium watch collection",
    "exclusive watches",
    "luxury watch online",
    "mechanical watch movement"
  ],
  authors: [{ name: "Alban Marcus Watches" }],
  creator: "Alban Marcus Watches Private Limited",
  publisher: "Alban Marcus Watches",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://albanmarcus.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Alban Marcus Watches - Luxury Mechanical Watches",
    description: "Discover premium Swiss movement mechanical watches. Luxury timepieces crafted with precision for discerning collectors. Shop authentic Alban Marcus watches online.",
    url: '/',
    siteName: 'Alban Marcus Watches',
    images: [
      {
        url: '/images/Am_logo_small_transparentpng.png',
        width: 1200,
        height: 630,
        alt: 'Alban Marcus Luxury Watches',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Alban Marcus Watches - Luxury Mechanical Watches",
    description: "Premium Swiss movement mechanical watches crafted with precision. Shop luxury timepieces online.",
    images: ['/images/Am_logo_small_transparentpng.png'],
    creator: '@albanmarcus',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    // yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  icons: {
    icon: [
      {
        url: '/images/Am_logo_small_transparentpng.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/images/Am_logo_small_transparentpng.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/images/Am_logo_small_transparentpng.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: '/images/Am_logo_small_transparentpng.png',
    apple: [
      {
        url: '/images/Am_logo_small_transparentpng.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1',
  category: 'shopping',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional favicon meta tags for better browser support */}
        <link rel="icon" type="image/png" sizes="32x32" href="/images/Am_logo_small_transparentpng.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/Am_logo_small_transparentpng.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/Am_logo_small_transparentpng.png" />
        <link rel="mask-icon" href="/images/Am_logo_small_transparentpng.png" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/images/Am_logo_small_transparentpng.png" />
        
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Hide content initially to prevent flash before loading screen */
            .app-content-wrapper {
              opacity: 0;
              transition: opacity 0.3s ease-in-out;
            }
            .app-content-wrapper.loaded {
              opacity: 1;
            }
            /* Ensure loading screen is always on top */
            .loading-screen {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 9999;
            }
            /* CSS-only loading screen for immediate display */
            body:not(.js-loaded) .app-content-wrapper {
              opacity: 0;
            }
            body:not(.js-loaded)::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: #000000;
              z-index: 10000;
              display: block;
            }
            /* Ensure smooth transition after hydration */
            body.js-loaded .app-content-wrapper {
              opacity: 1;
            }
          `
        }} />
      </head>
      <body
        className={`${centurygothic.className} ${ppneuemontrealNormal.variable} ${ppeditorialnewitalic.variable} ${timesNewRomanNormal.variable} bg-black-1 text-white-1`}
      >
        <GoogleAnalytics />
        <ErrorBoundary>
          <Providers>
            <ToastProvider>
              <UserModalProvider>
                <AppLoader
                  showOnFirstVisit={true}
                  showAlways={true}
                  minLoadingTime={3000}
                  loadingEnabledPaths={['/']}
                >
                  <Header />
                  <NavigationBoundary>
                    {children}
                  </NavigationBoundary>
                  <Footer />
                  <UserModalWrapper />
                  <CacheMonitor />
                </AppLoader>
              </UserModalProvider>
            </ToastProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
