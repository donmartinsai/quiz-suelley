import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Quiz — Você Não Está Louca | Dra. Su',
  description: 'Descubra se os sintomas que você sente podem estar relacionados à perimenopausa ou menopausa. Quiz gratuito da Dra. Su.',
  openGraph: {
    title: 'Quiz — Será que é perimenopausa ou menopausa?',
    description: 'Responda 9 perguntas rápidas e entenda o que seu corpo está tentando te dizer.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-[#FDF8F4]">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
