-- Schéma de base pour le SaaS Artisan Management

-- 1. Table des profils (artisans)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT NOT NULL,
  siret TEXT,
  phone TEXT,
  address TEXT,
  primary_color TEXT DEFAULT '#000000',
  enabled_modules TEXT[] DEFAULT ARRAY['clients', 'documents'],
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table du Stock
CREATE TABLE stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL DEFAULT 0,
  unit TEXT DEFAULT 'unité',
  min_stock DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table des Interventions (Planning)
CREATE TABLE interventions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table du Catalogue (Templates Prestations/Matériaux)
CREATE TABLE catalog_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL DEFAULT 0,
  unit TEXT DEFAULT 'unité',
  category TEXT, -- 'service', 'material'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des clients
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des factures / devis
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue');
CREATE TYPE document_type AS ENUM ('quote', 'invoice');

CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  type document_type NOT NULL DEFAULT 'quote',
  status invoice_status NOT NULL DEFAULT 'draft',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des définitions de champs personnalisés
CREATE TABLE field_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL, -- 'client' ou 'document'
  label TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'text', 'number', 'date', 'boolean'
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajout de metadata à clients aussi
ALTER TABLE clients ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- RLS (Row Level Security) - Sécurisation des données
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

-- Les artisans ne voient que LEURS propres données
CREATE POLICY "Artisans can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Artisans can view own clients" ON clients FOR SELECT USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can view own documents" ON documents FOR SELECT USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can manage own field definitions" ON field_definitions FOR ALL USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can manage own stock" ON stock FOR ALL USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can manage own interventions" ON interventions FOR ALL USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can manage own catalog" ON catalog_items FOR ALL USING (auth.uid() = artisan_id);

-- 8. Table des Messages (Support Chat)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique : On ne peut voir que les messages qu'on envoie ou qu'on reçoit
CREATE POLICY "Users can view own messages" ON messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Mise à jour : Carnet de Chantier & CRM
-- Mise à jour : Carnet de Chantier & CRM
ALTER TABLE interventions ADD COLUMN photos TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE clients ADD COLUMN notes TEXT;

-- 9. Trigger pour la création automatique de profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  selected_plan TEXT;
  modules TEXT[];
BEGIN
  selected_plan := COALESCE(new.raw_user_meta_data->>'plan', 'starter');
  
  IF selected_plan = 'expert' THEN
    modules := ARRAY['clients', 'documents', 'planning', 'stock'];
  ELSIF selected_plan = 'pro' THEN
    modules := ARRAY['clients', 'documents', 'planning'];
  ELSE
    modules := ARRAY['clients', 'documents'];
  END IF;

  INSERT INTO public.profiles (id, full_name, company_name, enabled_modules)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'company_name',
    modules
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Fonction pour le Portail Client (Accès public sécurisé via ID)
CREATE OR REPLACE FUNCTION public.get_public_document(doc_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'document', d,
    'artisan', p,
    'client', c
  ) INTO result
  FROM documents d
  JOIN profiles p ON d.artisan_id = p.id
  LEFT JOIN clients c ON d.client_id = c.id
  WHERE d.id = doc_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
