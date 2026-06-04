import { getAllPendingReviews } from '@/lib/supabase/queries-server'
import ReviewModerationClient from '@/components/admin/ReviewModerationClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moderate Reviews',
}

export default async function AdminReviewsPage() {
  const reviews = await getAllPendingReviews()

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Moderate Reviews</h1>
        <p className="mt-1 text-sm text-neutral-500">Approve or hide reviews submitted by users</p>
      </div>
      <ReviewModerationClient reviews={reviews} />
    </div>
  )
}
