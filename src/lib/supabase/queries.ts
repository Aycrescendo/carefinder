import { createClient } from './client'
import type {
  Hospital,
  HospitalInput,
  Review,
  ReviewStatus,
  FilterState,
  PaginatedResponse,
} from '@/types'

// ─── Hospital Queries ─────────────────────────────────────────────────────────

export async function searchHospitals(
  filters: Partial<FilterState>,
  page = 1,
  pageSize = 12
): Promise<PaginatedResponse<Hospital>> {
  const supabase = createClient()
  const offset = (page - 1) * pageSize

  // If radius search with coordinates, use PostGIS RPC
  if (filters.radius && filters.lat !== undefined && filters.lng !== undefined) {
    const { data, error } = await supabase.rpc('search_hospitals_radius', {
      lat: filters.lat,
      lng: filters.lng,
      radius_km: filters.radius,
      specialty_filter: filters.specialties?.length ? filters.specialties[0] : null,
      ownership_filter: filters.ownership ?? null,
      query_text: filters.query ?? null,
      page_offset: offset,
      page_limit: pageSize,
    })

    if (error) throw new Error(error.message)
    return {
      data: (data as Hospital[]) ?? [],
      count: data?.length ?? 0,
      page,
      pageSize,
    }
  }

  // Standard text/filter search
  let query = supabase.from('hospitals').select('*', { count: 'exact' })

  // Text search
  if (filters.query?.trim()) {
    query = query.or(
      `name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,lga.ilike.%${filters.query}%,address.ilike.%${filters.query}%`
    )
  }

  // City filter
  if (filters.city?.trim()) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  // LGA filter
  if (filters.lga?.trim()) {
    query = query.ilike('lga', `%${filters.lga}%`)
  }

  // Specialty filter
  if (filters.specialties?.length) {
    query = query.overlaps('specialties', filters.specialties)
  }

  // Ownership filter
  if (filters.ownership) {
    query = query.eq('ownership', filters.ownership)
  }

  // Pagination and ordering
  query = query.order('rating_avg', { ascending: false }).range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  return {
    data: (data as Hospital[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
  }
}

export async function getHospitalById(id: string): Promise<Hospital | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hospitals')
    .select(
      `
      *,
      images:hospital_images(*)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(error.message)
  }

  return data as Hospital
}

export async function getAllHospitals(): Promise<Hospital[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as Hospital[]) ?? []
}

export async function createHospital(input: HospitalInput): Promise<Hospital> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hospitals')
    .insert({
      ...input,
      location: `POINT(${input.longitude} ${input.latitude})`,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Hospital
}

export async function updateHospital(id: string, input: Partial<HospitalInput>): Promise<Hospital> {
  const supabase = createClient()

  const updateData: Record<string, unknown> = { ...input }
  if (input.latitude !== undefined && input.longitude !== undefined) {
    updateData.location = `POINT(${input.longitude} ${input.latitude})`
  }

  const { data, error } = await supabase
    .from('hospitals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Hospital
}

export async function deleteHospital(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('hospitals').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Review Queries ───────────────────────────────────────────────────────────

export async function getReviews(hospitalId: string, status?: ReviewStatus): Promise<Review[]> {
  const supabase = createClient()

  let query = supabase
    .from('reviews')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  } else {
    query = query.eq('status', 'approved')
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data as Review[]) ?? []
}

export async function getAllPendingReviews(): Promise<Review[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*, hospitals(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as Review[]) ?? []
}

export async function submitReview(
  hospitalId: string,
  rating: number,
  text?: string
): Promise<Review> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('You must be logged in to submit a review')

  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      {
        hospital_id: hospitalId,
        user_id: user.id,
        rating,
        text: text ?? null,
        status: 'pending',
      },
      { onConflict: 'hospital_id,user_id' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Review
}

export async function moderateReview(reviewId: string, status: ReviewStatus): Promise<Review> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Review
}

export async function getUserReview(hospitalId: string, userId: string): Promise<Review | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('hospital_id', hospitalId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as Review | null
}

// ─── Hospital Images ──────────────────────────────────────────────────────────

export async function uploadHospitalImage(hospitalId: string, file: File): Promise<string> {
  const supabase = createClient()

  const timestamp = Date.now()
  const path = `${hospitalId}/${timestamp}-${file.name}`

  const { error: uploadError } = await supabase.storage.from('hospital-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) throw new Error(uploadError.message)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error: dbError } = await supabase.from('hospital_images').insert({
    hospital_id: hospitalId,
    storage_path: path,
    uploaded_by: user?.id,
  })

  if (dbError) throw new Error(dbError.message)

  const { data } = supabase.storage.from('hospital-images').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteHospitalImage(imageId: string, storagePath: string): Promise<void> {
  const supabase = createClient()

  const { error: storageError } = await supabase.storage
    .from('hospital-images')
    .remove([storagePath])

  if (storageError) throw new Error(storageError.message)

  const { error: dbError } = await supabase.from('hospital_images').delete().eq('id', imageId)

  if (dbError) throw new Error(dbError.message)
}

// ─── User Queries ─────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  return profile
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}
