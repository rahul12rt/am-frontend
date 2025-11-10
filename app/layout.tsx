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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://albanmarcus.com'),
  title: {
    template: '%s | Alban Marcus Watches - luxury Mechanical Watches | Premium quartz Movement Timepieces',
    default: 'Alban Marcus Watches - luxury Mechanical Watches | Premium quartz Movement Timepieces',
  },
  description: 'Discover Alban Marcus luxury mechanical watches with quartz movement precision. Premium timepieces for collectors featuring exclusive designs, authentic craftsmanship, and timeless elegance. Shop luxury watches online.',
  keywords: [
    'Alban Marcus Watches',
    'luxury watches',
    'mechanical watches', 
    'automatic watches',
    'premium timepieces',
    'luxury watch collection',
    'authentic luxury watches',
    'watch collectors',
    'exclusive timepieces',
    'premium mechanical watches',
    'luxury watch brand',
    'automatic watches'
  ],
  authors: [{ name: 'Alban Marcus' }],
  creator: 'Alban Marcus Watches Private Limited',
  publisher: 'Alban Marcus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'luxury goods',
  classification: 'luxury watches',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Alban Marcus Watches - luxury Mechanical Watches',
    description: 'Discover premium mechanical watches with Swiss movement precision. Exclusive luxury timepieces for discerning collectors and watch enthusiasts.',
    siteName: 'Alban Marcus Watches',
    images: [
      {
        url: '/images/Am_logo_small_transparentpng.png',
        width: 800,
        height: 600,
        alt: 'Alban Marcus Luxury Watches',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alban Marcus Watches - luxury Mechanical Watches',
    description: 'Premium mechanical watches with Swiss movement precision. Exclusive luxury timepieces for collectors.',
    images: ['/images/Am_logo_small_transparentpng.png'],
    creator: '@albanmarcus',
    site: '@albanmarcus',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    // yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Alban Marcus',
  },
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/images/Am_logo_small_transparentpng.png',
    'msapplication-config': '/browserconfig.xml',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
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
