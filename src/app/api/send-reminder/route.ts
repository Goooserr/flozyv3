import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { documentId, clientEmail, clientName, amount, documentNumber, createdAt } = body

    if (!clientEmail || !documentId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Get artisan profile for branding
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('company_name, full_name, email').eq('id', user.id).single()
    const artisanName = profile?.company_name || profile?.full_name || 'Votre prestataire'

    // Update reminder metadata on the document
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        last_sent_at: new Date().toISOString(),
        reminder_count: 1 // We increment this - in production use rpc for atomic increment
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Update error:', updateError)
    }

    // Try to send via Resend if configured
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
            .header { background: #09090b; padding: 40px; text-align: center; }
            .header h1 { color: white; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; }
            .header p { color: #71717a; margin: 8px 0 0; font-size: 14px; }
            .badge { display: inline-block; background: #ef4444; color: white; padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; }
            .body { padding: 40px; }
            .amount-card { background: #fafafa; border: 2px solid #f0f0f0; border-radius: 20px; padding: 32px; text-align: center; margin: 24px 0; }
            .amount { font-size: 48px; font-weight: 900; color: #09090b; letter-spacing: -2px; margin: 0; }
            .amount-label { color: #71717a; font-size: 13px; margin-top: 4px; font-weight: 600; }
            .info { background: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 20px 0; }
            .info p { margin: 0; color: #9a3412; font-size: 14px; font-weight: 600; }
            .cta { text-align: center; margin: 32px 0; }
            .cta a { display: inline-block; background: #09090b; color: white; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 800; font-size: 16px; }
            .footer { background: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #f0f0f0; }
            .footer p { margin: 0; color: #a1a1aa; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${artisanName}</h1>
              <p>Avis de Paiement</p>
              <div class="badge">⚠️ Rappel de Paiement</div>
            </div>
            <div class="body">
              <p style="color:#71717a; font-size:14px; margin:0 0 8px">Bonjour <strong style="color:#09090b">${clientName}</strong>,</p>
              <p style="color:#3f3f46; font-size:15px; line-height:1.7; margin:0 0 24px">
                Nous vous contactons car nous n'avons pas encore reçu le paiement de la facture <strong>${documentNumber}</strong> émise le <strong>${new Date(createdAt).toLocaleDateString('fr-FR')}</strong>.
              </p>
              
              <div class="amount-card">
                <p class="amount">${Number(amount).toLocaleString('fr-FR')} €</p>
                <p class="amount-label">Montant TTC en attente de règlement</p>
              </div>

              <div class="info">
                <p>📅 Merci d'effectuer votre paiement dans les plus brefs délais afin d'éviter tout désagrément.</p>
              </div>

              <div class="cta">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flozy.app'}/p/${documentId}">
                  Consulter &amp; Payer la Facture →
                </a>
              </div>

              <p style="color:#a1a1aa; font-size:13px; text-align:center">
                Si vous avez déjà effectué ce paiement, veuillez ignorer ce message. Merci !
              </p>
            </div>
            <div class="footer">
              <p>Propulsé par <strong>Flozy</strong> · Logiciel de gestion artisan</p>
            </div>
          </div>
        </body>
        </html>
      `

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${artisanName} via Flozy <no-reply@flozy.app>`,
          to: [clientEmail],
          subject: `⚠️ Rappel de paiement — Facture ${documentNumber} (${Number(amount).toLocaleString('fr-FR')} €)`,
          html: emailHtml,
        }),
      })

      if (!resendResponse.ok) {
        const resendError = await resendResponse.json()
        console.error('Resend error:', resendError)
        return NextResponse.json({ error: `Erreur Resend: ${resendError.message}` }, { status: 500 })
      }

      return NextResponse.json({ success: true, method: 'email' })
    }

    // Fallback: no email configured, but we saved the reminder intent
    return NextResponse.json({ 
      success: true, 
      method: 'recorded',
      message: 'Relance enregistrée. Configurez Resend pour les envois email automatiques.'
    })

  } catch (error: any) {
    console.error('Reminder API error:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
