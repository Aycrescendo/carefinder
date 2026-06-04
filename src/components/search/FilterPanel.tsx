'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Specialty, Ownership } from '@/types'

const SPECIALTIES: Specialty[] = [
  'emergency',
  'maternity',
  'pediatric',
  'dental',
  'cardiology',
  'orthopedic',
  'ophthalmology',
  'neurology',
  'oncology',
  'general',
]

interface FilterPanelProps {
  initialSpecialties?: Specialty[]
  initialOwnership?: Ownership | null
  initialRadius?: number | null
  initialCity?: string
  initialLga?: string
}

export default function FilterPanel({
  initialSpecialties = [],
  initialOwnership = null,
  initialRadius = null,
  initialCity = '',
  initialLga = '',
}: FilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [specialties, setSpecialties] = useState<Specialty[]>(initialSpecialties)
  const [ownership, setOwnership] = useState<Ownership | null>(initialOwnership)
  const [radius, setRadius] = useState<number | null>(initialRadius)
  const [city, setCity] = useState(initialCity)
  const [lga, setLga] = useState(initialLga)
  const [locating, setLocating] = useState(false)

  function applyFilters(
    overrides: Partial<{
      specialties: Specialty[]
      ownership: Ownership | null
      radius: number | null
      city: string
      lga: string
    }> = {}
  ) {
    const params = new URLSearchParams(searchParams.toString())

    const activeSpecialties = overrides.specialties ?? specialties
    const activeOwnership = overrides.ownership !== undefined ? overrides.ownership : ownership
    const activeRadius = overrides.radius !== undefined ? overrides.radius : radius
    const activeCity = overrides.city ?? city
    const activeLga = overrides.lga ?? lga

    if (activeSpecialties.length > 0) {
      params.set('specialty', activeSpecialties[0])
    } else {
      params.delete('specialty')
    }

    if (activeOwnership) {
      params.set('ownership', activeOwnership)
    } else {
      params.delete('ownership')
    }

    if (activeRadius) {
      params.set('radius', activeRadius.toString())
    } else {
      params.delete('radius')
    }

    if (activeCity.trim()) {
      params.set('city', activeCity.trim())
    } else {
      params.delete('city')
    }

    if (activeLga.trim()) {
      params.set('lga', activeLga.trim())
    } else {
      params.delete('lga')
    }

    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  function toggleSpecialty(specialty: Specialty) {
    const updated = specialties.includes(specialty)
      ? specialties.filter((s) => s !== specialty)
      : [specialty] // single specialty for now
    setSpecialties(updated)
    applyFilters({ specialties: updated })
  }

  function handleOwnershipChange(value: Ownership | null) {
    setOwnership(value)
    applyFilters({ ownership: value })
  }

  function handleRadiusChange(value: number | null) {
    setRadius(value)
    if (value) {
      // Get location for radius search
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('radius', value.toString())
          params.set('lat', pos.coords.latitude.toString())
          params.set('lng', pos.coords.longitude.toString())
          params.delete('page')
          router.push(`/search?${params.toString()}`)
          setLocating(false)
        },
        () => {
          setLocating(false)
          alert('Location access denied. Radius search requires location permission.')
          setRadius(null)
        }
      )
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('radius')
      params.delete('lat')
      params.delete('lng')
      router.push(`/search?${params.toString()}`)
    }
  }

  function resetFilters() {
    setSpecialties([])
    setOwnership(null)
    setRadius(null)
    setCity('')
    setLga('')
    const params = new URLSearchParams()
    if (searchParams.get('query')) {
      params.set('query', searchParams.get('query')!)
    }
    router.push(`/search?${params.toString()}`)
  }

  const hasActiveFilters = specialties.length > 0 || ownership || radius || city || lga

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Reset all
          </button>
        )}
      </div>

      {/* City */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-700">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="e.g. Lagos"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
        />
      </div>

      {/* LGA */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-700">
          Local Government Area
        </label>
        <input
          type="text"
          value={lga}
          onChange={(e) => setLga(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="e.g. Ikeja"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
        />
      </div>

      {/* Ownership */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-700">Ownership</label>
        <div className="flex gap-2">
          {(['public', 'private'] as Ownership[]).map((type) => (
            <button
              key={type}
              onClick={() => handleOwnershipChange(ownership === type ? null : type)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                ownership === type
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-700">
          Distance from me
          {locating && <span className="ml-2 text-emerald-600">Locating...</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 25, 50].map((km) => (
            <button
              key={km}
              onClick={() => handleRadiusChange(radius === km ? null : km)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                radius === km
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-700">Specialty</label>
        <div className="flex flex-col gap-1.5">
          {SPECIALTIES.map((specialty) => (
            <label key={specialty} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={specialties.includes(specialty)}
                onChange={() => toggleSpecialty(specialty)}
                className="h-3.5 w-3.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm capitalize text-neutral-700">{specialty}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply button for city/LGA */}
      <button
        onClick={() => applyFilters()}
        className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Apply Filters
      </button>
    </div>
  )
}
