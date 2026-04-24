import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const interventionId = formData.get('interventionId') as string

    if (!file || !interventionId) {
      return NextResponse.json({ error: 'Fichier ou ID manquant' }, { status: 400 })
    }

    // Vérifier l'utilisateur connecté
    const supabaseUser = createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Client admin avec service_role pour le storage
    const supabaseAdmin = createSupabaseClient(
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
    const fileName = `${user.id}/${interventionId}/${Date.now()}.${fileExt}`
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

    // Enregistrer dans la table intervention_photos
    const { error: insertError } = await supabaseAdmin
      .from('intervention_photos')
      .insert({
        intervention_id: interventionId,
        artisan_id: user.id,
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
