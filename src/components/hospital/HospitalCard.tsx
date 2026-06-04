'use client'

import Link from 'next/link'
import type { Hospital } from '@/types'

interface HospitalCardProps {
  hospital: Hospital
  distance?: number | null
  showActions?: boolean
  onSelect?: (id: string) => void
  selected?: boolean
}

const SPECIALTY_COLORS: Record<string, string> = {
  emergency: 'bg-red-50 text-red-700 border-red-200',
  maternity: 'bg-pink-50 text-pink-700 border-pink-200',
  pediatric: 'bg-blue-50 text-blue-700 border-blue-200',
  dental: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  cardiology: 'bg-rose-50 text-rose-700 border-rose-200',
  orthopedic: 'bg-orange-50 text-orange-700 border-orange-200',
  ophthalmology: 'bg-purple-50 text-purple-700 border-purple-200',
  neurology: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  oncology: 'bg-violet-50 text-violet-700 border-violet-200',
  general: 'bg-neutral-50 text-neutral-700 border-neutral-200',
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={star <= Math.round(rating) ? 0 : 1.5}
            className={`h-3.5 w-3.5 ${
              star <= Math.round(rating) ? 'text-amber-400' : 'text-neutral-300'
            }`}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>
        ))}
      </div>
      <span className="text-xs text-neutral-500">
        {rating > 0 ? rating.toFixed(1) : 'No ratings'} {count > 0 && <span>({count})</span>}
      </span>
    </div>
  )
}

export default function HospitalCard({
  hospital,
  distance,
  showActions = false,
  onSelect,
  selected = false,
}: HospitalCardProps) {
  const visibleSpecialties = hospital.specialties.slice(0, 3)
  const remainingCount = hospital.specialties.length - 3

  return (
    <div
      className={`group relative rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
        selected
          ? 'border-emerald-400 ring-2 ring-emerald-200'
          : 'border-neutral-200 hover:border-emerald-200'
      }`}
    >
      {/* Ownership Badge */}
      <div className="absolute right-3 top-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            hospital.ownership === 'public'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {hospital.ownership === 'public' ? 'Public' : 'Private'}
        </span>
      </div>

      <div className="p-4">
        {/* Select checkbox */}
        {onSelect && (
          <div className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(hospital.id)}
              className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              aria-label={`Select ${hospital.name}`}
            />
            <span className="text-xs text-neutral-500">Select for export/share</span>
          </div>
        )}

        {/* Hospital Name */}
        <Link href={`/hospitals/${hospital.id}`}>
          <h3 className="mb-1 line-clamp-2 pr-16 text-base font-bold leading-snug text-neutral-900 transition-colors group-hover:text-emerald-700">
            {hospital.name}
          </h3>
        </Link>

        {/* Location */}
        <div className="mb-2 flex items-start gap-1.5 text-sm text-neutral-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
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
          <span className="line-clamp-1">
            {hospital.address}, {hospital.lga}, {hospital.city}
          </span>
        </div>

        {/* Distance */}
        {distance != null && (
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
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
                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z"
              />
            </svg>
            {distance < 1
              ? `${Math.round(distance * 1000)}m away`
              : `${distance.toFixed(1)} km away`}
          </div>
        )}

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={hospital.rating_avg} count={hospital.review_count} />
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {visibleSpecialties.map((specialty) => (
            <span
              key={specialty}
              className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                SPECIALTY_COLORS[specialty] ?? SPECIALTY_COLORS.general
              }`}
            >
              {specialty}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-500">
              +{remainingCount} more
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
            <a
              href={`tel:${hospital.phone}`}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
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
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
              Call
            </a>
            <Link
              href={`/hospitals/${hospital.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
            >
              View Details
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
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
