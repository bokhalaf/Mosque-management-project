import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from './ClientLayout'

export const metadata: Metadata = {
  title: 'Mosque Management Dashboard',
  description: 'A comprehensive operational dashboard for mosque management.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
