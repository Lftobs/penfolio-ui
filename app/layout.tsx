import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {ThemeProvider } from './components/ThemeProvider'
import Header from './components/Header'
import { cookies } from 'next/headers'
import { AuthProvider } from './components/context/Auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PenFolio - Your Digital Notebook',
  description: 'A beautiful digital notebook for your thoughts and ideas',
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider >
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200">
              <Header />
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}