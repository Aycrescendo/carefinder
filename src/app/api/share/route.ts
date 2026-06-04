import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, shareUrl, searchParams } = body

    if (!to || !shareUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build a human-readable description of the search
    const parts: string[] = []
    if (searchParams?.query) parts.push(`"${searchParams.query}"`)
    if (searchParams?.city) parts.push(`in ${searchParams.city}`)
    if (searchParams?.specialty) parts.push(`(${searchParams.specialty})`)
    if (searchParams?.radius) parts.push(`within ${searchParams.radius}km`)
    const searchDescription = parts.length > 0 ? parts.join(' ') : 'hospitals across Nigeria'

    const { error } = await resend.emails.send({
      from: 'Carefinder <noreply@carefinder.ng>',
      to: [to],
      subject: `Hospital search results — ${searchDescription}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Hospital Search Results</title>
          </head>
          <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#059669,#0d9488);padding:32px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                          Care<span style="color:#a7f3d0;">finder</span>
                        </h1>
                        <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">
                          Nigeria&apos;s Civic Hospital Directory
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
                          Someone shared a hospital search with you on Carefinder.
                        </p>

                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
                          <p style="margin:0 0 4px;color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                            Search
                          </p>
                          <p style="margin:0;color:#064e3b;font-size:15px;font-weight:600;">
                            ${searchDescription}
                          </p>
                        </div>

                        <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                          Click the button below to view the full list of hospitals on Carefinder.
                          You can filter results, view hospital details, and export to CSV.
                        </p>

                        <div style="text-align:center;margin:28px 0;">
                          <a
                            href="${shareUrl}"
                            style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:-0.2px;"
                          >
                            View Hospital Results →
                          </a>
                        </div>

                        <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                          Or copy this link: <a href="${shareUrl}" style="color:#059669;">${shareUrl}</a>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center;">
                        <p style="margin:0;color:#9ca3af;font-size:12px;">
                          Carefinder — Helping Nigerians find quality healthcare.
                          Free and open to all.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
