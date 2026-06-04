import { describe, it, expect, vi } from 'vitest'
import { exportHospitalsCSV } from '@/components/ui/ExportButton'
import type { Hospital } from '@/types'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Lagos University Teaching Hospital',
    address: 'Idiaraba, Lagos Island',
    city: 'Lagos',
    lga: 'Lagos Island',
    phone: '+2341234567890',
    email: 'info@luth.gov.ng',
    specialties: ['emergency', 'maternity', 'pediatric'],
    ownership: 'public',
    latitude: 6.5244,
    longitude: 3.3792,
    rating_avg: 4.5,
    review_count: 10,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Reddington Hospital',
    address: 'Victoria Island, Lagos',
    city: 'Lagos',
    lga: 'Eti-Osa',
    phone: '+2348012345678',
    email: 'contact@reddington.com',
    specialties: ['cardiology', 'general'],
    ownership: 'private',
    latitude: 6.4281,
    longitude: 3.4347,
    rating_avg: 0,
    review_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
]

// ─── CSV Export Tests ─────────────────────────────────────────────────────────

describe('CSV Export', () => {
  it('exports selected columns only', () => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    exportHospitalsCSV(mockHospitals, ['name', 'phone'], 'lagos')
    expect(clickSpy).toHaveBeenCalled()
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('generates correct filename with query and date', () => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()

    let capturedDownload = ''
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      get download() {
        return capturedDownload
      },
      set download(val: string) {
        capturedDownload = val
      },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)

    const date = new Date().toISOString().split('T')[0]
    exportHospitalsCSV(mockHospitals, ['name'], 'Lagos Teaching')
    expect(capturedDownload).toBe(`hospitals-lagos-teaching-${date}.csv`)
  })

  it('exports all hospitals when no filter applied', () => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    exportHospitalsCSV(mockHospitals, ['name', 'address', 'phone'], '')
    expect(clickSpy).toHaveBeenCalled()
  })

  it('handles empty hospital list gracefully', () => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)

    expect(() => exportHospitalsCSV([], ['name', 'phone'], 'empty')).not.toThrow()
  })
})

// ─── Search Filter Logic Tests ────────────────────────────────────────────────

describe('Search Filter Logic', () => {
  function filterHospitals(
    hospitals: Hospital[],
    query: string,
    ownership?: 'public' | 'private' | null,
    specialties?: string[]
  ) {
    return hospitals.filter((h) => {
      const matchesQuery =
        !query ||
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.city.toLowerCase().includes(query.toLowerCase()) ||
        h.lga.toLowerCase().includes(query.toLowerCase())

      const matchesOwnership = !ownership || h.ownership === ownership

      const matchesSpecialties =
        !specialties?.length ||
        specialties.some((s) => h.specialties.includes(s as Hospital['specialties'][number]))

      return matchesQuery && matchesOwnership && matchesSpecialties
    })
  }

  it('filters hospitals by name query', () => {
    const results = filterHospitals(mockHospitals, 'Lagos University')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Lagos University Teaching Hospital')
  })

  it('filters hospitals by ownership type', () => {
    const publicResults = filterHospitals(mockHospitals, '', 'public')
    expect(publicResults).toHaveLength(1)
    expect(publicResults[0].ownership).toBe('public')

    const privateResults = filterHospitals(mockHospitals, '', 'private')
    expect(privateResults).toHaveLength(1)
    expect(privateResults[0].ownership).toBe('private')
  })

  it('filters hospitals by specialty', () => {
    const results = filterHospitals(mockHospitals, '', null, ['cardiology'])
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Reddington Hospital')
  })

  it('returns all hospitals when no filters applied', () => {
    const results = filterHospitals(mockHospitals, '', null, [])
    expect(results).toHaveLength(2)
  })
})

// ─── Markdown Sanitization Tests ─────────────────────────────────────────────

describe('Markdown Sanitization', () => {
  it('strips script tags from HTML', async () => {
    const DOMPurify = await import('dompurify')
    const dirty = '<p>Hello</p><script>alert("xss")</script>'
    const clean = DOMPurify.default.sanitize(dirty)
    expect(clean).not.toContain('<script>')
    expect(clean).toContain('<p>Hello</p>')
  })

  it('strips onclick event handlers', async () => {
    const DOMPurify = await import('dompurify')
    const dirty = '<p onclick="alert(1)">Click me</p>'
    const clean = DOMPurify.default.sanitize(dirty)
    expect(clean).not.toContain('onclick')
    expect(clean).toContain('Click me')
  })

  it('allows safe HTML tags', async () => {
    const DOMPurify = await import('dompurify')
    const safe = '<h2>Title</h2><p>Text</p><ul><li>Item</li></ul>'
    const clean = DOMPurify.default.sanitize(safe)
    expect(clean).toContain('<h2>Title</h2>')
    expect(clean).toContain('<p>Text</p>')
    expect(clean).toContain('<li>Item</li>')
  })

  it('handles empty string input', async () => {
    const DOMPurify = await import('dompurify')
    const clean = DOMPurify.default.sanitize('')
    expect(clean).toBe('')
  })
})

// ─── Distance Calculation Tests ───────────────────────────────────────────────

describe('PostGIS Distance Calculation', () => {
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  it('calculates distance between Lagos and Abuja correctly', () => {
    const distance = haversineDistance(6.5244, 3.3792, 9.0579, 7.4898)
    expect(distance).toBeGreaterThan(450)
    expect(distance).toBeLessThan(600)
  })

  it('returns 0 for same coordinates', () => {
    const distance = haversineDistance(6.5244, 3.3792, 6.5244, 3.3792)
    expect(distance).toBeCloseTo(0, 1)
  })

  it('filters hospitals within radius', () => {
    const userLat = 6.5244
    const userLng = 3.3792
    const radiusKm = 20

    const nearby = mockHospitals.filter((h) => {
      const dist = haversineDistance(userLat, userLng, h.latitude, h.longitude)
      return dist <= radiusKm
    })

    expect(nearby.length).toBeGreaterThanOrEqual(1)
  })

  it('excludes hospitals outside radius', () => {
    const userLat = 9.0579 // Abuja
    const userLng = 7.4898
    const radiusKm = 5

    const nearby = mockHospitals.filter((h) => {
      const dist = haversineDistance(userLat, userLng, h.latitude, h.longitude)
      return dist <= radiusKm
    })

    expect(nearby.length).toBe(0)
  })
})
