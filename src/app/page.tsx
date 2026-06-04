'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SPECIALTIES = [
  'Emergency',
  'Maternity',
  'Pediatric',
  'Dental',
  'Cardiology',
  'Orthopedic',
  'Ophthalmology',
  'Neurology',
  'Oncology',
  'General',
]

const STATS = [
  { value: '20+', label: 'Hospitals Listed' },
  { value: '5', label: 'Major Cities' },
  { value: '10+', label: 'Specialties' },
  { value: '100%', label: 'Free to Use' },
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocationGranted(true)
        },
        () => {
          // Permission denied — graceful degradation
          setLocationGranted(false)
        }
      )
    }
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (coords) {
      params.set('lat', coords.lat.toString())
      params.set('lng', coords.lng.toString())
    }
    router.push(`/search?${params.toString()}`)
  }

  function handleSpecialtyClick(specialty: string) {
    const params = new URLSearchParams()
    params.set('specialty', specialty.toLowerCase())
    if (coords) {
      params.set('lat', coords.lat.toString())
      params.set('lng', coords.lng.toString())
    }
    router.push(`/search?${params.toString()}`)
  }

  function handleNearMe() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams()
        params.set('lat', position.coords.latitude.toString())
        params.set('lng', position.coords.longitude.toString())
        params.set('radius', '10')
        router.push(`/search?${params.toString()}`)
        setLocating(false)
      },
      () => {
        setLocating(false)
        alert('Location access denied. Please search by city or LGA instead.')
      }
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-4 py-20 sm:py-28">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            Nigeria&apos;s Civic Hospital Directory
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find the Right Hospital, <span className="text-emerald-200">Right Now</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-emerald-100 sm:text-xl">
            Search hospitals across Nigeria by name, city, LGA, or specialty. Export results, share
            with others, and find care near you.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 text-neutral-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by hospital name, city, or LGA..."
                  className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-base text-neutral-900 shadow-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Search
              </button>
            </div>

            {/* Near Me Button */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleNearMe}
                disabled={locating}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                {locating ? 'Locating...' : 'Hospitals near me'}
              </button>

              {locationGranted && (
                <span className="flex items-center gap-1 text-xs text-emerald-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Location ready
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-extrabold text-emerald-600">{stat.value}</div>
                <div className="mt-0.5 text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Specialty */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Browse by Specialty</h2>
            <p className="mt-2 text-neutral-500">
              Find hospitals that match your specific healthcare needs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyClick(specialty)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
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
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700 group-hover:text-emerald-700">
                  {specialty}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-neutral-500">Finding healthcare in Nigeria, simplified</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Search',
                description:
                  'Search by hospital name, city, LGA, or let us detect your location automatically.',
              },
              {
                step: '02',
                title: 'Filter & Compare',
                description:
                  'Filter by specialty, ownership type, and distance. View results on a map or list.',
              },
              {
                step: '03',
                title: 'Export & Share',
                description:
                  'Download your results as a CSV or share a link with family and friends.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 text-4xl font-extrabold text-emerald-100">{item.step}</div>
                <h3 className="mb-2 text-lg font-bold text-neutral-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Ready to find a hospital?
          </h2>
          <p className="mt-3 text-neutral-500">
            Browse all hospitals in our directory — no account required.
          </p>
          <a
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-emerald-700"
          >
            Browse All Hospitals
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  )
}
