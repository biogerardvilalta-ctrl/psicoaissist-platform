import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ConditionalHeader, ConditionalFooter } from '@/components/layout'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PsicoAIssist - Asistente IA para Psicólogos',
    template: '%s | PsicoAIssist'
  },
  description: 'Potencia tu práctica psicológica con IA responsable. Transcripción automática, informes profesionales y análisis inteligente. GDPR compliant.',
  keywords: [
    'psicólogo',
    'IA',
    'transcripción',
    'sesiones',
    'GDPR',
    'inteligencia artificial',
    'informes clínicos',
    'práctica psicológica',
    'asistente virtual',
    'transcripción automática',
    'análisis de sesiones',
    'software psicología'
  ],
  authors: [{ name: 'PsicoAIssist Team' }],
  creator: 'PsicoAIssist',
  publisher: 'PsicoAIssist',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://psicoaissist.com',
    siteName: 'PsicoAIssist',
    title: 'PsicoAIssist - Asistente IA para Psicólogos',
    description: 'Potencia tu práctica psicológica con IA responsable. Transcripción automática, informes profesionales y análisis inteligente.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PsicoAIssist - Asistente IA para Psicólogos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@psicoaissist',
    creator: '@psicoaissist',
    title: 'PsicoAIssist - Asistente IA para Psicólogos',
    description: 'Potencia tu práctica psicológica con IA responsable. Transcripción automática, informes profesionales y análisis inteligente.',
    images: ['/twitter-image.jpg'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "PsicoAIssist",
              "applicationCategory": "MedicalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "29.00",
                "priceCurrency": "EUR"
              },
              "description": "Asistente IA para psicólogos con transcripción segura y generación de informes.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "124"
              }
            })
          }}
        />
        <AuthProvider>
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}