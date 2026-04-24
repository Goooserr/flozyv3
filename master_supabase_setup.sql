-- #################################################################
-- MASTER SETUP FLOZY SAAS - CONFIGURATION COMPLÈTE
-- #################################################################

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TYPES ENUM
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('quote', 'invoice');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLE DES PROFILS (ARTISANS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  siret TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  enabled_modules TEXT[] DEFAULT ARRAY['clients', 'documents'],
  is_admin BOOLEAN DEFAULT false,
  subscription_plan TEXT DEFAULT 'Starter', -- 'Starter', 'Pro', 'Expert'
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE DES CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE DU STOCK
CREATE TABLE IF NOT EXISTS public.stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL DEFAULT 0,
  unit TEXT DEFAULT 'unité',
  min_stock DECIMAL DEFAULT 0,
  purchase_price NUMERIC DEFAULT 0, -- Nouveau champ pour le rendement
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE DES INTERVENTIONS (PLANNING)
CREATE TABLE IF NOT EXISTS public.interventions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE DES DOCUMENTS (FACTURES / DEVIS)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type document_type NOT NULL DEFAULT 'quote',
  status invoice_status NOT NULL DEFAULT 'draft',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  document_number TEXT,
  due_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Contient les items et calculs de rendement
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLE DES MESSAGES (SUPPORT CHAT)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SÉCURITÉ (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Politiques : Tout le monde gère ses propres données
-- On supprime les anciennes pour éviter les erreurs de doublons
DO $$ BEGIN
    DROP POLICY IF EXISTS "Manage own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Manage own clients" ON public.clients;
    DROP POLICY IF EXISTS "Manage own stock" ON public.stock;
    DROP POLICY IF EXISTS "Manage own interventions" ON public.interventions;
    DROP POLICY IF EXISTS "Manage own documents" ON public.documents;
    DROP POLICY IF EXISTS "Manage own messages" ON public.messages;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Manage own clients" ON public.clients FOR ALL USING (auth.uid() = artisan_id);
CREATE POLICY "Manage own stock" ON public.stock FOR ALL USING (auth.uid() = artisan_id);
CREATE POLICY "Manage own interventions" ON public.interventions FOR ALL USING (auth.uid() = artisan_id);
CREATE POLICY "Manage own documents" ON public.documents FOR ALL USING (auth.uid() = artisan_id);
CREATE POLICY "Manage own messages" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 10. AUTOMATISATION : CRÉATION DE PROFIL À L'INSCRIPTION
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  selected_plan TEXT;
  modules TEXT[];
BEGIN
  selected_plan := COALESCE(new.raw_user_meta_data->>'plan', 'Starter');
  
  IF selected_plan = 'Expert' THEN
    modules := ARRAY['clients', 'documents', 'planning', 'stock'];
  ELSIF selected_plan = 'Pro' THEN
    modules := ARRAY['clients', 'documents', 'planning'];
  ELSE
    modules := ARRAY['clients', 'documents'];
  END IF;

  INSERT INTO public.profiles (id, full_name, company_name, email, subscription_plan, enabled_modules)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'company_name',
    new.email,
    selected_plan,
    modules
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- #################################################################
-- FIN DU SCRIPT
-- #################################################################
