'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { moderateReview } from '@/lib/supabase/queries'
import type { Review } from '@/types'

interface ReviewModerationClientProps {
  reviews: Review[]
}

export default function ReviewModerationClient({
  reviews: initialReviews,
}: ReviewModerationClientProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleModerate(reviewId: string, status: 'approved' | 'hidden') {
    setProcessing(reviewId)
    try {
      await moderateReview(reviewId, status)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to moderate review')
    } finally {
      setProcessing(null)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7 text-emerald-600"
          >
            <path
              fillRule="evenodd"
              d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-neutral-900">No pending reviews</h3>
        <p className="mt-1 text-sm text-neutral-500">
          All reviews have been moderated. Check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {/* Star rating */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={star <= review.rating ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={star <= review.rating ? 0 : 1.5}
                      className={`h-4 w-4 ${
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
                <span className="text-sm font-semibold text-neutral-900">{review.rating}/5</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Pending
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                Submitted{' '}
                {new Date(review.created_at).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {review.text && (
            <p className="mb-4 rounded-lg bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700">
              {review.text}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleModerate(review.id, 'approved')}
              disabled={processing === review.id}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                  clipRule="evenodd"
                />
              </svg>
              {processing === review.id ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => handleModerate(review.id, 'hidden')}
              disabled={processing === review.id}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
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
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
              Hide
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
