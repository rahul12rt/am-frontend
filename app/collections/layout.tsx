import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Luxury Watch Collections - Alban Marcus Premium Timepieces",
  description: "Explore Alban Marcus luxury watch collections. Premium mechanical watches with Swiss movement, exclusive timepieces for collectors. Shop authentic luxury watches online.",
  keywords: [
    "luxury watch collection",
    "Alban Marcus watches", 
    "premium timepieces",
    "mechanical watches",
    "Swiss movement watches",
    "luxury watch catalog",
    "exclusive watches",
    "watch collections online"
  ],
  openGraph: {
    title: "Luxury Watch Collections - Alban Marcus",
    description: "Discover premium mechanical watches with Swiss movement precision. Exclusive luxury timepieces for discerning collectors.",
    images: ['/images/Am_logo_small_transparentpng.png'],
  },
  alternates: {
    canonical: '/collections',
  },
}

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
