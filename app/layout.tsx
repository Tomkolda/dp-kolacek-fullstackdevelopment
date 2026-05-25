// import './globals.scss';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

// import './style.css';
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import type {Metadata} from 'next';

import {theme} from './theme-ff';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8080');

// todo (fre-57): create a valid metadata
export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'Free Fall',
    template: '%s | Free Fall',
  },
  description: 'Metalová kapela z Uherského Hradiště',
  keywords: ['Free Fall', 'metal', 'kapela', 'Uherské Hradiště', 'hudba'],
  authors: [{name: 'Free Fall'}],
  creator: 'Free Fall',
  publisher: 'Free Fall',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: defaultUrl,
    siteName: 'Free Fall',
    title: 'Free Fall - Metalová kapela z Uherského Hradiště',
    description: 'Metalová kapela z Uherského Hradiště',
    images: [
      {
        url: '/og-image.jpg', // Přidej obrázek pro Open Graph
        width: 1200,
        height: 630,
        alt: 'Free Fall',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Fall - Metalová kapela z Uherského Hradiště',
    description: 'Metalová kapela z Uherského Hradiště',
    images: ['/og-image.jpg'],
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

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="cs" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
