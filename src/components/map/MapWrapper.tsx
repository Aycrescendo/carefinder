'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Hospital } from '@/types'

const HospitalMap = dynamic(() => import('./HospitalMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <p className="text-sm text-neutral-500">Loading map...</p>
      </div>
    </div>
  ),
})

interface MapWrapperProps {
  hospitals: Hospital[]
}

export default function MapWrapper({ hospitals }: MapWrapperProps) {
  const [view, setView] = useState<'list' | 'map'>('list')

  return (
    <div className="w-full">
      {/* View Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'list'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            List
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z"
              />
            </svg>
            Map
          </button>
        </div>
      </div>

      {/* Map View */}
      {view === 'map' && (
        <div className="h-[600px] w-full">
          <HospitalMap hospitals={hospitals} />
        </div>
      )}
    </div>
  )
}
