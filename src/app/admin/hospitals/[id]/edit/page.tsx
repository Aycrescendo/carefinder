import { getHospitalById } from '@/lib/supabase/queries-server'
import HospitalForm from '@/components/admin/HospitalForm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Hospital',
}

export default async function EditHospitalPage({ params }: { params: { id: string } }) {
  const hospital = await getHospitalById(params.id)
  if (!hospital) notFound()

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Edit Hospital</h1>
        <p className="mt-1 text-sm text-neutral-500">Update the details for {hospital.name}</p>
      </div>
      <HospitalForm mode="edit" hospital={hospital} />
    </div>
  )
}
