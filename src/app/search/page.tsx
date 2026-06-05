import { Suspense } from 'react'
import { searchHospitals } from '@/lib/supabase/queries-server'
import HospitalCard from '@/components/hospital/HospitalCard'
import SearchBar from '@/components/search/SearchBar'
import FilterPanel from '@/components/search/FilterPanel'
import ExportButton from '@/components/ui/ExportButton'
import ShareButton from '@/components/ui/ShareButton'
import type { SearchParams, FilterState, Specialty, Ownership } from '@/types'
import type { Metadata } from 'next'
import MapWrapper from '@/components/map/MapWrapper'

export const metadata: Metadata = {
  title: 'Search Hospitals',
  description: 'Search hospitals across Nigeria by name, city, LGA, specialty, and more.',
}

interface SearchPageProps {
  searchParams: SearchParams
}

function buildFilters(searchParams: SearchParams): Partial<FilterState> {
  return {
    query: searchParams.query ?? '',
    city: searchParams.city ?? '',
    lga: searchParams.lga ?? '',
    specialties: searchParams.specialty ? [searchParams.specialty as Specialty] : [],
    ownership: (searchParams.ownership as Ownership) ?? null,
    radius: searchParams.radius ? Number(searchParams.radius) : null,
    lat: searchParams.lat ? Number(searchParams.lat) : undefined,
    lng: searchParams.lng ? Number(searchParams.lng) : undefined,
  }
}

function SearchSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100"
        />
      ))}
    </div>
  )
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const filters = buildFilters(searchParams)
  const page = searchParams.page ? Number(searchParams.page as string) : 1

  let results: Awaited<ReturnType<typeof searchHospitals>> = {
    data: [],
    count: 0,
    page: 1,
    pageSize: 12,
  }
  let error = null

  try {
    results = await searchHospitals(filters, page)
  } catch (e) {
    console.error('Search error full:', e)
    error = e instanceof Error ? e.message : 'Failed to load hospitals'
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">Failed to load hospitals</p>
        <p className="mt-1 text-xs text-red-500">{error}</p>
      </div>
    )
  }

  if (results.data.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-7 w-7 text-neutral-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-neutral-900">No hospitals found</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Try adjusting your search terms or removing some filters.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Results header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-900">{results.count}</span> hospital
          {results.count !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <ExportButton hospitals={results.data} searchQuery={searchParams.query ?? ''} />
          <ShareButton />
        </div>
      </div>

      {/* Map / List toggle */}
      <MapWrapper hospitals={results.data} />

      {/* Results grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.data.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            distance={hospital.distance_km}
            showActions
          />
        ))}
      </div>

      {/* Pagination */}
      {results.count > results.pageSize && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <a
              href={`/search?${new URLSearchParams({
                ...searchParams,
                page: String(page - 1),
              })}`}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Previous
            </a>
          )}
          <span className="text-sm text-neutral-500">
            Page {page} of {Math.ceil(results.count / results.pageSize)}
          </span>
          {page < Math.ceil(results.count / results.pageSize) && (
            <a
              href={`/search?${new URLSearchParams({
                ...searchParams,
                page: String(page + 1),
              })}`}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Find Hospitals</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Search across Nigeria by name, city, LGA, specialty, or proximity
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-neutral-100" />}>
          <SearchBar defaultValue={searchParams.query ?? ''} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filter Panel */}
        <aside className="w-full shrink-0 lg:w-64">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-neutral-100" />}>
            <FilterPanel
              initialSpecialties={
                searchParams.specialty ? [searchParams.specialty as Specialty] : []
              }
              initialOwnership={(searchParams.ownership as Ownership) ?? null}
              initialRadius={searchParams.radius ? Number(searchParams.radius) : null}
              initialCity={searchParams.city ?? ''}
              initialLga={searchParams.lga ?? ''}
            />
          </Suspense>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
