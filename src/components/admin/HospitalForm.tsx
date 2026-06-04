'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { hospitalSchema, type HospitalFormValues } from '@/lib/schemas'
import { createHospital, updateHospital } from '@/lib/supabase/queries'
import type { Hospital } from '@/types'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const SPECIALTIES = [
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
] as const

interface HospitalFormProps {
  hospital?: Hospital
  mode: 'create' | 'edit'
}

export default function HospitalForm({ hospital, mode }: HospitalFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: hospital
      ? {
          name: hospital.name,
          address: hospital.address,
          city: hospital.city,
          lga: hospital.lga,
          phone: hospital.phone,
          email: hospital.email ?? '',
          specialties: hospital.specialties as HospitalFormValues['specialties'],
          ownership: hospital.ownership,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          description_md: hospital.description_md ?? '',
          visiting_hours: hospital.visiting_hours ?? '',
        }
      : {
          ownership: 'public',
          specialties: [],
        },
  })

  async function onSubmit(values: HospitalFormValues) {
    setSubmitting(true)
    setServerError(null)

    try {
      if (mode === 'create') {
        await createHospital(values)
      } else if (hospital) {
        await updateHospital(hospital.id, values)
      }
      router.push('/admin/dashboard')
      router.refresh()
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-neutral-900">Basic Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Hospital Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Lagos University Teaching Hospital"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('address')}
              placeholder="e.g. Idiaraba, Lagos Island"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              {...register('city')}
              placeholder="e.g. Lagos"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
          </div>

          {/* LGA */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              LGA <span className="text-red-500">*</span>
            </label>
            <input
              {...register('lga')}
              placeholder="e.g. Lagos Island"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.lga && <p className="mt-1 text-xs text-red-600">{errors.lga.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              {...register('phone')}
              placeholder="+2348012345678"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="info@hospital.com"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Ownership */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Ownership <span className="text-red-500">*</span>
            </label>
            <select
              {...register('ownership')}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            {errors.ownership && (
              <p className="mt-1 text-xs text-red-600">{errors.ownership.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-bold text-neutral-900">Coordinates</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Get coordinates from{' '}
          <a
            href="https://www.latlong.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 underline"
          >
            latlong.net
          </a>{' '}
          — must be within Nigeria (lat: 4–14, lng: 2–15)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              {...register('latitude', { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="e.g. 6.5244"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.latitude && (
              <p className="mt-1 text-xs text-red-600">{errors.latitude.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              {...register('longitude', { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="e.g. 3.3792"
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            {errors.longitude && (
              <p className="mt-1 text-xs text-red-600">{errors.longitude.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-neutral-900">
          Specialties <span className="text-red-500">*</span>
        </h2>
        <Controller
          name="specialties"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {SPECIALTIES.map((specialty) => (
                <label
                  key={specialty}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                    field.value?.includes(specialty)
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={field.value?.includes(specialty) ?? false}
                    onChange={(e) => {
                      const current = field.value ?? []
                      if (e.target.checked) {
                        field.onChange([...current, specialty])
                      } else {
                        field.onChange(current.filter((s) => s !== specialty))
                      }
                    }}
                    className="sr-only"
                  />
                  {specialty}
                </label>
              ))}
            </div>
          )}
        />
        {errors.specialties && (
          <p className="mt-2 text-xs text-red-600">{errors.specialties.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-neutral-900">Description</h2>
        <Controller
          name="description_md"
          control={control}
          render={({ field }) => (
            <div data-color-mode="light">
              <MDEditor value={field.value} onChange={field.onChange} height={300} preview="live" />
            </div>
          )}
        />
      </div>

      {/* Visiting Hours */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-neutral-900">Visiting Hours</h2>
        <textarea
          {...register('visiting_hours')}
          rows={3}
          placeholder="e.g. Monday–Friday: 10:00–12:00 and 16:00–18:00&#10;Emergency: 24 hours"
          className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/dashboard')}
          className="rounded-xl border border-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Hospital'
              : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
