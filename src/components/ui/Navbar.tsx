'use client'

import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
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

        {/* Desktop Nav */}
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
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 sm:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-2">
            <a
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-emerald-600"
            >
              🔍 Find Hospitals
            </a>
            <a
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Admin Login
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
