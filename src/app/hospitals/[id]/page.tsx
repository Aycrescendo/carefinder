import { getHospitalById, getReviews } from '@/lib/supabase/queries-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
marked.setOptions({ breaks: true })
import Link from 'next/link'
import RatingWidget from '@/components/hospital/RatingWidget'

interface HospitalPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: HospitalPageProps): Promise<Metadata> {
  const hospital = await getHospitalById(params.id)
  if (!hospital) return { title: 'Hospital Not Found' }
  return {
    title: hospital.name,
    description: `${hospital.name} in ${hospital.city}, ${hospital.lga}. Specialties: ${hospital.specialties.join(', ')}.`,
  }
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
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={star <= Math.round(rating) ? 0 : 1.5}
            className={`h-5 w-5 ${
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
      <span className="text-sm text-neutral-500">
        {rating > 0 ? (
          <>
            <span className="font-semibold text-neutral-900">{rating.toFixed(1)}</span> ({count}{' '}
            review{count !== 1 ? 's' : ''})
          </>
        ) : (
          'No reviews yet'
        )}
      </span>
    </div>
  )
}

export default async function HospitalPage({ params }: HospitalPageProps) {
  const [hospital, reviews] = await Promise.all([getHospitalById(params.id), getReviews(params.id)])

  if (!hospital) notFound()

  const descriptionHtml = hospital.description_md
    ? DOMPurify.sanitize(marked.parse(hospital.description_md.replace(/\\n/g, '\n')) as string)
    : null

  return (
    <div className="py-8">
      {/* Back button */}
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-emerald-600"
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
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back to Search
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold leading-tight text-neutral-900">{hospital.name}</h1>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  hospital.ownership === 'public'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {hospital.ownership === 'public' ? 'Public' : 'Private'}
              </span>
            </div>

            {/* Location */}
            <div className="mb-3 flex items-center gap-2 text-sm text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 shrink-0"
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
              {hospital.address}, {hospital.lga}, {hospital.city}
            </div>

            {/* Rating */}
            <div className="mb-4">
              <StarRating rating={hospital.rating_avg} count={hospital.review_count} />
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                    SPECIALTY_COLORS[specialty] ?? SPECIALTY_COLORS.general
                  }`}
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          {descriptionHtml && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-neutral-900">About</h2>
              <div
                className="prose prose-sm prose-neutral max-w-none prose-headings:font-bold prose-a:text-emerald-600"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No reviews yet. Be the first to review this hospital.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={star <= review.rating ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={star <= review.rating ? 0 : 1.5}
                            className={`h-3.5 w-3.5 ${
                              star <= review.rating ? 'text-amber-400' : 'text-neutral-300'
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
                      <span className="text-xs text-neutral-400">
                        {new Date(review.created_at).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {review.text && (
                      <p className="text-sm leading-relaxed text-neutral-700">{review.text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-neutral-900">Contact Information</h2>
            <div className="space-y-3">
              <a
                href={`tel:${hospital.phone}`}
                className="flex items-center gap-3 text-sm text-neutral-700 transition-colors hover:text-emerald-600"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4 text-emerald-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                </div>
                {hospital.phone}
              </a>

              {hospital.email && (
                <a
                  href={`mailto:${hospital.email}`}
                  className="flex items-center gap-3 text-sm text-neutral-700 transition-colors hover:text-emerald-600"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4 text-emerald-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  {hospital.email}
                </a>
              )}

              <div className="flex items-start gap-3 text-sm text-neutral-700">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4 text-emerald-600"
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
                </div>
                <span>
                  {hospital.address}, {hospital.lga}, {hospital.city}
                </span>
              </div>
            </div>

            <a
              href={`tel:${hospital.phone}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
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
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
              Call Hospital
            </a>
          </div>

          {/* Visiting Hours */}
          {hospital.visiting_hours && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-neutral-900">Visiting Hours</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {hospital.visiting_hours}
              </p>
            </div>
          )}

          {/* Rating Widget */}
          <RatingWidget hospitalId={hospital.id} hospitalName={hospital.name} />

          {/* Map placeholder */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-neutral-900">Location</h2>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${hospital.name}, ${hospital.address}, ${hospital.city}, Nigeria`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z"
                />
              </svg>
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
