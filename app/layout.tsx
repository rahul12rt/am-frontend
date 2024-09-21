import type { Metadata } from "next";
import localFont from "next/font/local";

import Header from '@/components/organisms/header/Header';

import "./globals.scss";

const centurygothic = localFont({
  src: '../public/fonts/gothic/centurygothic.ttf',
});

export const metadata: Metadata = {
  title: 'ALBAN MARCUS',
  description:
    'Mechanical watches may go through up to 50 or 60 different processes before the watch is considered to be as near to perfect as humanly possible before delivery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={centurygothic.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
