import { createClient as supabaseCreateClient } from '@supabase/supabase-js'
import type {
  Hospital,
  HospitalInput,
  Review,
  ReviewStatus,
  FilterState,
  PaginatedResponse,
} from '@/types'

function getSupabase() {
  return supabaseCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
}

export async function searchHospitals(
  filters: Partial<FilterState>,
  page = 1,
  pageSize = 12
): Promise<PaginatedResponse<Hospital>> {
  const supabase = getSupabase()
  const offset = (page - 1) * pageSize

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

  let query = supabase.from('hospitals').select('*', { count: 'exact' })

  if (filters.query?.trim()) {
    query = query.or(
      `name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,lga.ilike.%${filters.query}%,address.ilike.%${filters.query}%`
    )
  }

  if (filters.city?.trim()) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters.lga?.trim()) {
    query = query.ilike('lga', `%${filters.lga}%`)
  }

  if (filters.specialties?.length) {
    query = query.overlaps('specialties', filters.specialties)
  }

  if (filters.ownership) {
    query = query.eq('ownership', filters.ownership)
  }

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
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('hospitals')
    .select(`*, images:hospital_images(*)`)
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as Hospital
}

export async function getReviews(hospitalId: string, status?: ReviewStatus): Promise<Review[]> {
  const supabase = getSupabase()
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
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, hospitals(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Review[]) ?? []
}

export async function getAllHospitals(): Promise<Hospital[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as Hospital[]) ?? []
}

export async function createHospital(input: HospitalInput): Promise<Hospital> {
  const supabase = getSupabase()
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
  const supabase = getSupabase()
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
  const supabase = getSupabase()
  const { error } = await supabase.from('hospitals').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function moderateReview(reviewId: string, status: ReviewStatus): Promise<Review> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Review
}
