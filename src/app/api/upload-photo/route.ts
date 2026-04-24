import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Route API côté serveur pour l'upload de photos
// Utilise la service_role key pour créer le bucket si besoin
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const interventionId = formData.get('interventionId') as string

    if (!file || !interventionId) {
      return NextResponse.json({ error: 'Fichier ou ID manquant' }, { status: 400 })
    }

    // Client admin avec service_role pour gérer le storage
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const BUCKET = 'photos'

    // Créer le bucket s'il n'existe pas
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === BUCKET)
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(BUCKET, { public: true })
    }

    // Upload du fichier
    const fileExt = file.name.split('.').pop()
    const fileName = `interventions/${interventionId}/${Date.now()}.${fileExt}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    // Mettre à jour les photos de l'intervention
    const { data: intervention } = await supabaseAdmin
      .from('interventions')
      .select('photos')
      .eq('id', interventionId)
      .single()

    const currentPhotos = (intervention?.photos as string[]) || []

    const { error: updateError } = await supabaseAdmin
      .from('interventions')
      .update({ photos: [...currentPhotos, publicUrl] })
      .eq('id', interventionId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
