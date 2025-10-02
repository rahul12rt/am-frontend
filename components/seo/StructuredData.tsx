import Script from 'next/script'

interface OrganizationSchema {
  "@context": string
  "@type": string
  name: string
  url: string
  logo: string
  description: string
  address: {
    "@type": string
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  contactPoint: {
    "@type": string
    telephone: string
    contactType: string
    email: string
  }
  sameAs: string[]
}

interface ProductSchema {
  "@context": string
  "@type": string
  name: string
  description: string
  brand: {
    "@type": string
    name: string
  }
  offers: {
    "@type": string
    url: string
    priceCurrency: string
    price: string
    availability: string
    seller: {
      "@type": string
      name: string
    }
  }
  image: string[]
  aggregateRating?: {
    "@type": string
    ratingValue: string
    reviewCount: string
  }
}

interface WebsiteSchema {
  "@context": string
  "@type": string
  name: string
  url: string
  description: string
  potentialAction: {
    "@type": string
    target: {
      "@type": string
      urlTemplate: string
    }
    "query-input": string
  }
}

interface BreadcrumbSchema {
  "@context": string
  "@type": string
  itemListElement: Array<{
    "@type": string
    position: number
    name: string
    item: string
  }>
}

interface StructuredDataProps {
  type: 'organization' | 'product' | 'website' | 'breadcrumb'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://albanmarcus.com'

  const getSchema = () => {
    switch (type) {
      case 'organization':
        const organizationSchema: OrganizationSchema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Alban Marcus Watches Private Limited",
          url: baseUrl,
          logo: `${baseUrl}/images/Am_logo_small_transparentpng.png`,
          description: "Premium luxury mechanical watches crafted with Swiss movement precision. Alban Marcus offers exclusive timepieces for discerning collectors.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "No-484/1, P. No. 484, Kalkere, Horamavu",
            addressLocality: "Bangalore North",
            addressRegion: "Karnataka",
            postalCode: "560043",
            addressCountry: "IN"
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-XXXXXXXXXX",
            contactType: "customer service",
            email: "contact@albanmarcus.com"
          },
          sameAs: [
            "https://www.instagram.com/albanmarcus",
            "https://www.facebook.com/albanmarcus",
            "https://www.twitter.com/albanmarcus"
          ]
        }
        return organizationSchema

      case 'product':
        if (!data) return null
        const productSchema: ProductSchema = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: data.name || "Alban Marcus Luxury Watch",
          description: data.description || "Premium mechanical watch with Swiss movement",
          brand: {
            "@type": "Brand",
            name: "Alban Marcus"
          },
          offers: {
            "@type": "Offer",
            url: `${baseUrl}/collections/${data.id}`,
            priceCurrency: "INR",
            price: data.price || "0",
            availability: data.stockavailability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Organization",
              name: "Alban Marcus Watches Private Limited"
            }
          },
          image: data.images || [`${baseUrl}/images/Am_logo_small_transparentpng.png`],
          ...(data.rating && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: data.rating.toString(),
              reviewCount: data.reviewCount?.toString() || "1"
            }
          })
        }
        return productSchema

      case 'website':
        const websiteSchema: WebsiteSchema = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Alban Marcus Watches",
          url: baseUrl,
          description: "Luxury mechanical watches with Swiss movement precision. Shop premium timepieces online.",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/collections?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        }
        return websiteSchema

      case 'breadcrumb':
        if (!data?.breadcrumbs) return null
        const breadcrumbSchema: BreadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: data.breadcrumbs.map((item: any, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`
          }))
        }
        return breadcrumbSchema

      default:
        return null
    }
  }

  const schema = getSchema()
  if (!schema) return null

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  )
}
