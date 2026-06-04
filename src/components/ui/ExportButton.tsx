'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import type { Hospital, ExportColumn } from '@/types'

interface ExportButtonProps {
  hospitals: Hospital[]
  searchQuery?: string
}

const COLUMNS: { key: ExportColumn; label: string }[] = [
  { key: 'name', label: 'Hospital Name' },
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'specialties', label: 'Specialties' },
  { key: 'rating', label: 'Rating' },
]

export function exportHospitalsCSV(hospitals: Hospital[], columns: ExportColumn[], query: string) {
  const date = new Date().toISOString().split('T')[0]
  const slug = query.trim().toLowerCase().replace(/\s+/g, '-') || 'all'
  const filename = `hospitals-${slug}-${date}.csv`

  const data = hospitals.map((h) => {
    const row: Record<string, string> = {}
    if (columns.includes('name')) row['Hospital Name'] = h.name
    if (columns.includes('address')) row['Address'] = `${h.address}, ${h.lga}, ${h.city}`
    if (columns.includes('phone')) row['Phone'] = h.phone
    if (columns.includes('email')) row['Email'] = h.email ?? ''
    if (columns.includes('specialties')) row['Specialties'] = h.specialties.join(', ')
    if (columns.includes('rating'))
      row['Rating'] = h.rating_avg > 0 ? h.rating_avg.toFixed(1) : 'No ratings'
    return row
  })

  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ExportButton({ hospitals, searchQuery = '' }: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<ExportColumn[]>([
    'name',
    'address',
    'phone',
    'specialties',
  ])

  function toggleColumn(col: ExportColumn) {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  function handleExport() {
    exportHospitalsCSV(hospitals, selectedColumns, searchQuery)
    setShowModal(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={hospitals.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 disabled:opacity-50"
        title="Export to CSV"
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
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Export CSV
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Export to CSV</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mb-4 text-sm text-neutral-500">
              Exporting <span className="font-semibold text-neutral-700">{hospitals.length}</span>{' '}
              hospital{hospitals.length !== 1 ? 's' : ''}. Select columns to include:
            </p>

            <div className="mb-6 space-y-2.5">
              {COLUMNS.map((col) => (
                <label key={col.key} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-neutral-700">{col.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedColumns.length === 0}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
