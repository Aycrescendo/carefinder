'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitReview } from '@/lib/supabase/queries'

interface RatingWidgetProps {
  hospitalId: string
  hospitalName: string
}

export default function RatingWidget({ hospitalId, hospitalName }: RatingWidgetProps) {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedStar, setSelectedStar] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingReview, setExistingReview] = useState(false)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser({ id: user.id, email: user.email ?? '' })

        // Check if user already reviewed this hospital
        const { data: review } = await supabase
          .from('reviews')
          .select('id, rating')
          .eq('hospital_id', hospitalId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (review) {
          setExistingReview(true)
          setSelectedStar(review.rating)
        }
      }
      setLoading(false)
    }
    getUser()
  }, [hospitalId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStar) {
      setError('Please select a star rating.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await submitReview(hospitalId, selectedStar, reviewText || undefined)
      setSubmitted(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-neutral-100" />
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-emerald-600"
          >
            <path
              fillRule="evenodd"
              d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-emerald-800">Review submitted!</p>
        <p className="mt-1 text-xs text-emerald-600">
          Your review is pending approval and will appear shortly.
        </p>
      </div>
    )
  }

  if (existingReview) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <p className="text-sm font-medium text-neutral-700">You already reviewed this hospital.</p>
        <p className="mt-1 text-xs text-neutral-500">
          You gave it {selectedStar} star{selectedStar !== 1 ? 's' : ''}.
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="mb-2 text-sm font-bold text-neutral-900">Rate this hospital</h3>
        <p className="mb-4 text-sm text-neutral-500">
          Sign in to leave a review for {hospitalName}.
        </p>
        <a
          href={`/auth/login?redirectTo=/hospitals/${hospitalId}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Sign in to Review
        </a>
        <a
          href="/auth/signup"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Create Account
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900">Rate this hospital</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            Sign out
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star selector */}
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-700">
            Your rating <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setSelectedStar(star)}
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={star <= (hoveredStar || selectedStar) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={star <= (hoveredStar || selectedStar) ? 0 : 1.5}
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredStar || selectedStar) ? 'text-amber-400' : 'text-neutral-300'
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ))}
            {selectedStar > 0 && (
              <span className="ml-2 text-sm font-medium text-neutral-600">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedStar]}
              </span>
            )}
          </div>
        </div>

        {/* Review text */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-700">
            Your review (optional)
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share your experience with this hospital..."
            className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
          />
          <p className="mt-1 text-right text-xs text-neutral-400">{reviewText.length}/1000</p>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !selectedStar}
          className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
