import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ConditionalHeader, ConditionalFooter } from '@/components/layout'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import '../../styles/globals.css'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { getTranslations } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] })

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      default: t('title.default'),
      template: t('title.template')
    },
    description: t('description'),
    keywords: t('keywords').split(',').map(k => k.trim()),
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
      locale: locale,
      url: 'https://psicoaissist.com',
      siteName: 'PsicoAIssist',
      title: t('title.default'),
      description: t('description'),
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: t('title.default'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@psicoaissist',
      creator: '@psicoaissist',
      title: t('title.default'),
      description: t('description'),
      images: ['/twitter-image.jpg'],
    },
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/icon.svg',
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
  };
}


export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode,
  params: { locale: string }
}) {
  const messages = useMessages();

  return (
    <html lang={locale}>
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
        <NextIntlClientProvider locale={locale} messages={messages} now={new Date()}>
          <AuthProvider>
            <ConditionalHeader />
            {children}
            <ConditionalFooter />
            <Toaster />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}