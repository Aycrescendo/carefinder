import { z } from 'zod'

// ─── Hospital Schema ──────────────────────────────────────────────────────────

export const specialtyEnum = z.enum([
  'maternity',
  'emergency',
  'dental',
  'pediatric',
  'cardiology',
  'orthopedic',
  'ophthalmology',
  'neurology',
  'oncology',
  'general',
])

export const ownershipEnum = z.enum(['public', 'private'])

export const hospitalSchema = z.object({
  name: z
    .string()
    .min(2, 'Hospital name must be at least 2 characters')
    .max(100, 'Hospital name must be less than 100 characters'),

  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),

  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),

  lga: z
    .string()
    .min(2, 'LGA must be at least 2 characters')
    .max(50, 'LGA must be less than 50 characters'),

  phone: z
    .string()
    .regex(/^\+234[0-9]{10}$/, 'Phone must be a valid Nigerian number in format +234XXXXXXXXXX'),

  email: z.string().email('Must be a valid email address').optional().or(z.literal('')),

  specialties: z.array(specialtyEnum).min(1, 'At least one specialty is required'),

  ownership: ownershipEnum,

  // Nigeria bounding box: lat 4–14, lng 2–15
  latitude: z
    .number()
    .min(4, 'Latitude must be within Nigeria (4–14)')
    .max(14, 'Latitude must be within Nigeria (4–14)'),

  longitude: z
    .number()
    .min(2, 'Longitude must be within Nigeria (2–15)')
    .max(15, 'Longitude must be within Nigeria (2–15)'),

  description_md: z.string().optional(),

  visiting_hours: z.string().optional(),
})

export type HospitalFormValues = z.infer<typeof hospitalSchema>

// ─── Review Schema ────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  hospital_id: z.string().uuid('Invalid hospital ID'),

  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),

  text: z.string().max(1000, 'Review must be less than 1000 characters').optional(),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>

// ─── Email Share Schema ───────────────────────────────────────────────────────

export const emailShareSchema = z.object({
  to: z.string().email('Must be a valid email address'),

  hospitalIds: z
    .array(z.string().uuid())
    .min(1, 'Select at least one hospital')
    .max(20, 'You can share up to 20 hospitals at once'),

  senderName: z.string().max(50).optional(),
})

export type EmailShareFormValues = z.infer<typeof emailShareSchema>

// ─── Search Schema ────────────────────────────────────────────────────────────

export const searchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  lga: z.string().optional(),
  specialty: specialtyEnum.optional(),
  ownership: ownershipEnum.optional(),
  radius: z.number().min(1).max(100).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export type SearchFormValues = z.infer<typeof searchSchema>

// ─── Admin Login Schema ───────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ─── Admin Invite Schema ──────────────────────────────────────────────────────

export const inviteAdminSchema = z.object({
  email: z.string().email('Must be a valid email address'),
})

export type InviteAdminFormValues = z.infer<typeof inviteAdminSchema>
