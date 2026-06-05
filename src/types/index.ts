// ─── Hospital ────────────────────────────────────────────────────────────────

export type Specialty =
  | 'maternity'
  | 'emergency'
  | 'dental'
  | 'pediatric'
  | 'cardiology'
  | 'orthopedic'
  | 'ophthalmology'
  | 'neurology'
  | 'oncology'
  | 'general'

export type Ownership = 'public' | 'private'

export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  lga: string
  phone: string
  email?: string
  specialties: Specialty[]
  ownership: Ownership
  latitude: number
  longitude: number
  description_md?: string
  visiting_hours?: string
  rating_avg: number
  review_count: number
  created_by?: string
  created_at: string
  distance_km?: number // populated by PostGIS radius query
  images?: HospitalImage[]
}

export interface HospitalImage {
  id: string
  hospital_id: string
  storage_path: string
  uploaded_by?: string
  created_at: string
}

export interface HospitalInput {
  name: string
  address: string
  city: string
  lga: string
  phone: string
  email?: string
  specialties: Specialty[]
  ownership: Ownership
  latitude: number
  longitude: number
  description_md?: string
  visiting_hours?: string
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'hidden'

export interface Review {
  id: string
  hospital_id: string
  user_id: string
  rating: number
  text?: string
  status: ReviewStatus
  created_at: string
  user?: {
    email: string
  }
}

export interface ReviewInput {
  hospital_id: string
  rating: number
  text?: string
}

// ─── Users ───────────────────────────────────────────────────────────────────

export type UserRole = 'public' | 'admin'

export interface AppUser {
  id: string
  email: string
  role: UserRole
  created_at: string
}

// ─── Search & Filters ────────────────────────────────────────────────────────

export interface FilterState {
  query: string
  specialties: Specialty[]
  ownership: Ownership | null
  radius: number | null
  city: string
  lga: string
  lat?: number
  lng?: number
}
export interface SearchParams {
  query?: string
  city?: string
  lga?: string
  specialty?: string
  ownership?: string
  radius?: string
  lat?: string
  lng?: string
  page?: string
  [key: string]: string | undefined
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

export type ExportColumn = 'name' | 'address' | 'phone' | 'email' | 'specialties' | 'rating'

export interface ExportOptions {
  columns: ExportColumn[]
  query: string
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
