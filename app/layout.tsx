import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Quiz — Descubra em qual fase hormonal você está | Dra. Suelley',
  description: 'Responda 11 perguntas rápidas e receba um mapa personalizado dos seus sintomas. Gratuito, baseado em ciência. Dra. Suelley Macedo Marques · CRM 2982/RR',
  metadataBase: new URL('https://www.quiz.vocenaoestalouca.com.br'),
  openGraph: {
    title: 'Você não está louca — é a perimenopausa',
    description: 'Descubra em qual fase hormonal você está. Quiz gratuito da Dra. Suelley. 11 perguntas · 3 minutos · resultado personalizado.',
    url: 'https://www.quiz.vocenaoestalouca.com.br',
    siteName: 'Você Não Está Louca',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://www.quiz.vocenaoestalouca.com.br/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quiz Dra. Suelley — Você Não Está Louca',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Você não está louca — é a perimenopausa',
    description: 'Quiz gratuito: descubra em qual fase hormonal você está.',
    images: ['https://www.quiz.vocenaoestalouca.com.br/og-image.png'],
  },
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-[#FDF8F4]">
      <head>
        {/* Preload imagem da Dra. Su para carregamento rapido */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/dra-su.webp" 
          fetchPriority="high"
        />
        {/* Preload prints de depoimentos do Instagram */}
        <link rel="preload" as="image" href="/depoimentos/print-comentario-1.jpg" />
        <link rel="preload" as="image" href="/depoimentos/print-comentario-2.jpg" />
        <link rel="preload" as="image" href="/depoimentos/print-comentario-3.jpg" />
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '974654145243851');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=974654145243851&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="font-sans antialiased pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
