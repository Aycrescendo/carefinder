export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAllHospitals, getAllPendingReviews } from '@/lib/supabase/queries-server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const [hospitals, pendingReviews] = await Promise.all([getAllHospitals(), getAllPendingReviews()])

  const stats = {
    total: hospitals.length,
    public: hospitals.filter((h) => h.ownership === 'public').length,
    private: hospitals.filter((h) => h.ownership === 'private').length,
    pendingReviews: pendingReviews.length,
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage hospital listings and reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/hospitals/new"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Hospital
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Hospitals',
            value: stats.total,
            icon: '🏥',
            color: 'bg-emerald-50 text-emerald-700',
          },
          {
            label: 'Public Hospitals',
            value: stats.public,
            icon: '🏛️',
            color: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'Private Hospitals',
            value: stats.private,
            icon: '🏢',
            color: 'bg-amber-50 text-amber-700',
          },
          {
            label: 'Pending Reviews',
            value: stats.pendingReviews,
            icon: '⭐',
            color: 'bg-purple-50 text-purple-700',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 text-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
            <div className="text-sm text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/hospitals/new"
          className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-emerald-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">Add New Hospital</div>
            <div className="text-xs text-neutral-500">Create a new listing</div>
          </div>
        </Link>

        <Link
          href="/admin/reviews"
          className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">Moderate Reviews</div>
            <div className="text-xs text-neutral-500">
              {stats.pendingReviews} pending review{stats.pendingReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </Link>

        <Link
          href="/search"
          className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">View Public Site</div>
            <div className="text-xs text-neutral-500">See what users see</div>
          </div>
        </Link>
      </div>

      {/* Hospitals Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-base font-bold text-neutral-900">All Hospitals</h2>
          <span className="text-sm text-neutral-500">{hospitals.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {hospitals.map((hospital) => (
                <tr key={hospital.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{hospital.name}</div>
                    <div className="text-xs text-neutral-500">{hospital.lga}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{hospital.city}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        hospital.ownership === 'public'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {hospital.ownership}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {hospital.rating_avg > 0 ? hospital.rating_avg.toFixed(1) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/hospitals/${hospital.id}`}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/hospitals/${hospital.id}/edit`}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
