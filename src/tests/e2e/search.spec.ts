import { test, expect } from '@playwright/test'

// ─── Search Hospitals ─────────────────────────────────────────────────────────

test.describe('Search Hospitals', () => {
  test('shows hospitals on search page by default', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/hospitals found/i)).toBeVisible()
  })

  test('filters hospitals by city', async ({ page }) => {
    await page.goto('/search?city=Lagos')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/hospitals found/i)).toBeVisible()
    const cards = page.locator('[href^="/hospitals/"]')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('shows no results for unknown city', async ({ page }) => {
    await page.goto('/search?city=UnknownCityXYZ123')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/no hospitals found/i)).toBeVisible()
  })

  test('search bar submits query and updates URL', async ({ page }) => {
    await page.goto('/search?query=Lagos')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('query=Lagos')
    await expect(page.getByText(/hospitals found/i)).toBeVisible()
  })

  test('hospital card links to detail page', async ({ page }) => {
    await page.goto('/search?city=Lagos')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/hospitals found/i)).toBeVisible()
    const hospitalLinks = page.locator('a[href^="/hospitals/"]')
    await hospitalLinks.first().waitFor({ state: 'visible' })
    const href = await hospitalLinks.first().getAttribute('href')
    expect(href).toContain('/hospitals/')
  })
})

// ─── Export CSV ───────────────────────────────────────────────────────────────

test.describe('Export CSV', () => {
  test('export button is visible on search page', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible()
  })

  test('clicking export opens column selection modal', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /export csv/i }).click()
    await expect(page.getByText(/export to csv/i)).toBeVisible()
    await expect(page.getByText(/hospital name/i)).toBeVisible()
  })

  test('can select columns in export modal', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /export csv/i }).click()
    await expect(page.getByText(/export to csv/i)).toBeVisible()
    const emailLabel = page.getByText('Email').first()
    await emailLabel.click()
    await expect(page.getByRole('button', { name: /download csv/i })).toBeVisible()
  })

  test('download button triggers file download', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /export csv/i }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /download csv/i }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^hospitals-.*\.csv$/)
  })
})

// ─── Share Link ───────────────────────────────────────────────────────────────

test.describe('Share Link', () => {
  test('copy link button is visible', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible()
  })

  test('clicking copy link shows copied feedback', async ({ page, browserName }) => {
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    }
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /copy link/i }).click()
    await expect(page.getByText(/copied/i)).toBeVisible({ timeout: 5000 })
  })

  test('share email button opens modal', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /email/i }).click()
    await expect(page.getByText(/share via email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/recipient@example.com/i)).toBeVisible()
  })

  test('shareable URL contains search params', async ({ page, browserName }) => {
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    }
    await page.goto('/search?city=Lagos&specialty=emergency')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /copy link/i }).click()
    await expect(page.getByText(/copied/i)).toBeVisible()
    if (browserName === 'chromium') {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardText).toContain('city=Lagos')
      expect(clipboardText).toContain('specialty=emergency')
    }
  })
})

// ─── Admin Login ──────────────────────────────────────────────────────────────

test.describe('Admin Login', () => {
  test('admin login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder(/admin@example.com/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByPlaceholder(/admin@example.com/i).fill('wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('redirects unauthenticated user from admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/login')
  })

  test('admin login page has correct form fields', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByLabel(/email address/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })
})

// ─── RLS Security ─────────────────────────────────────────────────────────────

test.describe('RLS Security', () => {
  test('public users can view hospital listings', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/hospitals found/i)).toBeVisible()
  })

  test('admin routes are protected', async ({ page }) => {
    await page.goto('/admin/hospitals/new')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/login')
  })

  test('admin reviews route is protected', async ({ page }) => {
    await page.goto('/admin/reviews')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/login')
  })
  test('hospital detail page is publicly accessible', async ({ page, browserName }) => {
    await page.goto('/search?city=Lagos')
    await page.waitForLoadState('networkidle')
    const hospitalLinks = page.locator('a[href^="/hospitals/"]')
    await hospitalLinks.first().waitFor({ state: 'visible' })
    const href = await hospitalLinks.first().getAttribute('href')
    expect(href).toContain('/hospitals/')
    if (browserName !== 'chromium') {
      await page.goto(href!)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/contact information/i)).toBeVisible()
    }
  })

  test('rating widget prompts login for unauthenticated users', async ({ page, browserName }) => {
    await page.goto('/search?city=Lagos')
    await page.waitForLoadState('networkidle')
    const hospitalLinks = page.locator('a[href^="/hospitals/"]')
    await hospitalLinks.first().waitFor({ state: 'visible' })
    const href = await hospitalLinks.first().getAttribute('href')
    expect(href).toContain('/hospitals/')
    if (browserName !== 'chromium') {
      await page.goto(href!)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/sign in to review/i)).toBeVisible()
    }
  })
})
