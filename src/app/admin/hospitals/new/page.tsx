import HospitalForm from '@/components/admin/HospitalForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add New Hospital',
}

export default function NewHospitalPage() {
  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Add New Hospital</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Fill in the details below to create a new hospital listing
        </p>
      </div>
      <HospitalForm mode="create" />
    </div>
  )
}
