-- #################################################################
-- MASTER SETUP FLOZY SAAS - CONFIGURATION COMPLÈTE & DÉFINITIVE
-- #################################################################

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TYPES ENUM
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('quote', 'invoice');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. NETTOYAGE COMPLET
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.intervention_photos CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.interventions CASCADE;
DROP TABLE IF EXISTS public.stock CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 4. TABLE DES PROFILS (ARTISANS & EMPLOYÉS)
CREATE TABLE public.profiles (
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
  role TEXT DEFAULT 'artisan',
  employer_id UUID REFERENCES public.profiles(id),
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  enabled_modules TEXT[] DEFAULT ARRAY['clients', 'documents'],
  is_suspended BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE DES CLIENTS
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE DU STOCK (AVEC RENDEMENT & PRIX)
CREATE TABLE public.stock (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL DEFAULT 0,
  unit TEXT DEFAULT 'unité',
  min_stock DECIMAL DEFAULT 0,
  purchase_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  category TEXT DEFAULT 'Général',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE DES INTERVENTIONS (PLANNING)
CREATE TABLE public.interventions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLE DES DOCUMENTS (DEVIS / FACTURES)
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type document_type NOT NULL DEFAULT 'quote',
  status invoice_status NOT NULL DEFAULT 'draft',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  document_number TEXT,
  due_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLE DES MESSAGES
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SÉCURITÉ (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles access" ON public.profiles FOR SELECT USING (auth.uid() = id OR employer_id = auth.uid());
CREATE POLICY "Clients access" ON public.clients FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Stock access" ON public.stock FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Interventions access" ON public.interventions FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Documents access" ON public.documents FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Messages access" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 11. TRIGGER INSCRIPTION
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  selected_plan TEXT;
  modules TEXT[];
  user_role TEXT;
  parent_id UUID;
BEGIN
  selected_plan := LOWER(COALESCE(new.raw_user_meta_data->>'plan', 'starter'));
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'artisan');
  IF new.raw_user_meta_data->>'employer_id' IS NOT NULL THEN
    parent_id := (new.raw_user_meta_data->>'employer_id')::UUID;
  END IF;
  
  IF user_role = 'employee' THEN
    modules := ARRAY['clients', 'documents', 'planning', 'stock'];
  ELSIF selected_plan = 'expert' THEN
    modules := ARRAY['clients', 'documents', 'planning', 'stock'];
  ELSIF selected_plan = 'pro' THEN
    modules := ARRAY['clients', 'documents', 'planning'];
  ELSE
    modules := ARRAY['clients', 'documents'];
  END IF;

  INSERT INTO public.profiles (id, full_name, company_name, email, subscription_plan, enabled_modules, role, employer_id)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company_name', new.email, selected_plan, modules, user_role, parent_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
