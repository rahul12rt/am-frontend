import type { Metadata } from "next";
import localFont from "next/font/local";

import Header from '@/components/organisms/header/Header';

import "./globals.scss";

const centurygothic = localFont({
  src: '../public/fonts/gothic/centurygothic.ttf',
});

const ppneuemontrealNormal = localFont({
  src: '../public/fonts/ppneuemontreal/ppneuemontreal-book.woff',
  variable: '--font-ppneuemontrealNormal',
});

const ppeditorialnewitalic = localFont({
  src: '../public/fonts/ppeditorialnew/ppeditorialnew-ultralightItalic.otf',
  variable: '--font-ppeditorialnewitalic',
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
      <body
        className={`${centurygothic.className} ${ppneuemontrealNormal.variable} ${ppeditorialnewitalic.variable} bg-black-1 text-white-1`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
