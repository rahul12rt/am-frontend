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
  title: "ALBAN MARCUS",
  description:
    "Mechanical watches may go through up to 50 or 60 different processes before the watch is considered to be as near to perfect as humanly possible before delivery.",
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
