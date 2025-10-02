import Script from 'next/script'

interface LocalBusinessSchemaProps {
  companyName?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  contactInfo?: {
    telephone: string
    email: string
  }
}

export default function LocalBusinessSchema({ 
  companyName = "Alban Marcus Watches Private Limited",
  address = {
    streetAddress: "No-484/1, P. No. 484, Kalkere, Horamavu",
    addressLocality: "Bangalore North",
    addressRegion: "Karnataka", 
    postalCode: "560043",
    addressCountry: "IN"
  },
  contactInfo = {
    telephone: "+91-XXXXXXXXXX",
    email: "contact@albanmarcus.com"
  }
}: LocalBusinessSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://albanmarcus.com'

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#organization`,
    "name": companyName,
    "alternateName": "Alban Marcus",
    "description": "Premium luxury mechanical watches with Swiss movement precision. Exclusive timepieces for discerning collectors and watch enthusiasts.",
    "url": baseUrl,
    "logo": `${baseUrl}/images/Am_logo_small_transparentpng.png`,
    "image": [
      `${baseUrl}/images/Am_logo_small_transparentpng.png`,
      `${baseUrl}/images/banner.webp`,
      `${baseUrl}/images/hero_image.jpg`
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": contactInfo.telephone,
        "email": contactInfo.email,
        "contactType": "customer service",
        "availableLanguage": ["English", "Hindi"],
        "areaServed": "IN"
      }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "13.0827",
      "longitude": "77.5877"
    },
    "priceRange": "₹₹₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Luxury Watch Collections",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Mechanical Watches",
            "category": "Luxury Timepieces"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Swiss Movement Watches",
            "category": "Premium Watches"
          }
        }
      ]
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Watch Repair and Maintenance",
          "description": "Professional watch repair and maintenance services"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Watch Authentication",
          "description": "Authentic luxury watch verification services"
        }
      }
    ],
    "sameAs": [
      "https://www.instagram.com/albanmarcus",
      "https://www.facebook.com/albanmarcus",
      "https://www.twitter.com/albanmarcus",
      "https://www.linkedin.com/company/albanmarcus"
    ],
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Alban Marcus"
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 10,
      "maxValue": 50
    },
    "knowsAbout": [
      "Luxury Watches",
      "Mechanical Timepieces", 
      "Automatic Watches",
      "Watch Collecting",
      "Horology",
      "Premium Watches"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "India"
    }
  }

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema)
      }}
    />
  )
}
