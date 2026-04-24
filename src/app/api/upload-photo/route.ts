import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const interventionId = formData.get('interventionId') as string
    const artisanId = formData.get('artisanId') as string

    if (!file || !interventionId || !artisanId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Client admin — service_role bypasse RLS pour l'upload
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const BUCKET = 'photos'

    // Créer le bucket s'il n'existe pas
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    if (!buckets?.some(b => b.name === BUCKET)) {
      await supabaseAdmin.storage.createBucket(BUCKET, { public: true })
    }

    // Upload du fichier
    const fileExt = file.name.split('.').pop()
    const fileName = `${artisanId}/${interventionId}/${Date.now()}.${fileExt}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    // Insérer dans intervention_photos
    const { error: insertError } = await supabaseAdmin
      .from('intervention_photos')
      .insert({
        intervention_id: interventionId,
        artisan_id: artisanId,
        url: publicUrl,
        file_name: file.name,
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
