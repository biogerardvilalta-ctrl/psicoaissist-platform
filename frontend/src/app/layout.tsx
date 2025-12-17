import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ConditionalHeader, ConditionalFooter } from '@/components/layout'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PsychoAI - Asistente IA para Psicólogos',
    template: '%s | PsychoAI'
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
  authors: [{ name: 'PsychoAI Team' }],
  creator: 'PsychoAI',
  publisher: 'PsychoAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://psychoai.com',
    siteName: 'PsychoAI',
    title: 'PsychoAI - Asistente IA para Psicólogos',
    description: 'Potencia tu práctica psicológica con IA responsable. Transcripción automática, informes profesionales y análisis inteligente.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PsychoAI - Asistente IA para Psicólogos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@psychoai',
    creator: '@psychoai',
    title: 'PsychoAI - Asistente IA para Psicólogos',
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