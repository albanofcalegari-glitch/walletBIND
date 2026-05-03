import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/theme'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'walletBIND',
  description: 'Billetera corporativa powered by BIND',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100 font-sans transition-colors duration-200">
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('wb-theme');if(t==='dark'||(!t&&!window.matchMedia('(prefers-color-scheme: light)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`}</Script>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
