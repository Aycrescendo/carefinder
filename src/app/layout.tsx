import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "Carefinder — Nigeria's Hospital Directory",
    template: '%s | Carefinder',
  },
  description:
    'Find, export, and share hospital information across Nigeria. Search by city, LGA, specialty, or proximity.',
  keywords: ['hospitals', 'Nigeria', 'healthcare', 'medical', 'directory', 'Lagos', 'Abuja'],
  openGraph: {
    title: "Carefinder — Nigeria's Hospital Directory",
    description: 'Find hospitals across Nigeria by location, specialty, and more.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen bg-neutral-50 font-sans antialiased">
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            {/* Logo */}
            <a href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-colors group-hover:bg-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M11.25 3.375A8.625 8.625 0 1 0 20.625 12 8.625 8.625 0 0 0 11.25 3.375ZM12 7.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 12 7.5Z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900">
                Care<span className="text-emerald-600">finder</span>
              </span>
            </a>

            {/* Nav Links */}
            <nav className="hidden items-center gap-6 sm:flex">
              <a
                href="/search"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-600"
              >
                Find Hospitals
              </a>
              <a
                href="/admin/login"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                Admin Login
              </a>
            </nav>

            {/* Mobile menu button */}
            <button className="flex items-center gap-1 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 sm:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6">{children}</main>

        <footer className="mt-20 border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M11.25 3.375A8.625 8.625 0 1 0 20.625 12 8.625 8.625 0 0 0 11.25 3.375ZM12 7.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 12 7.5Z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  Care<span className="text-emerald-600">finder</span>
                </span>
              </div>
              <p className="text-center text-sm text-neutral-500">
                Helping Nigerians find quality healthcare since 2025. Free and open to all.
              </p>
              <p className="text-sm text-neutral-400">© {new Date().getFullYear()} Carefinder</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
