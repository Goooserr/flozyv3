-- #################################################################
-- MASTER SETUP FLOZY SAAS - CONFIGURATION COMPLÈTE STABLE
-- #################################################################

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. NETTOYAGE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.intervention_photos CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.interventions CASCADE;
DROP TABLE IF EXISTS public.stock CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.field_definitions CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. TABLE DES PROFILS
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  role TEXT DEFAULT 'artisan',
  employer_id UUID REFERENCES public.profiles(id),
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  enabled_modules TEXT[] DEFAULT ARRAY['clients', 'documents'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLES DE DONNÉES
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.stock (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL DEFAULT 0,
  unit TEXT DEFAULT 'unité',
  min_stock DECIMAL DEFAULT 5,
  purchase_price DECIMAL DEFAULT 0,
  selling_price DECIMAL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.interventions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled',
  address TEXT,
  notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artisan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('quote', 'invoice')),
  document_number TEXT,
  amount DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SÉCURITÉ (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by self/employer" ON public.profiles FOR SELECT USING (auth.uid() = id OR employer_id = auth.uid());
CREATE POLICY "Clients access" ON public.clients FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Stock access" ON public.stock FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Interventions access" ON public.interventions FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Documents access" ON public.documents FOR ALL USING (artisan_id = auth.uid() OR artisan_id = (SELECT employer_id FROM public.profiles WHERE id = auth.uid()));

-- 6. TRIGGER INSCRIPTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name, email, role, employer_id, subscription_plan)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'artisan'),
    (new.raw_user_meta_data->>'employer_id')::UUID,
    COALESCE(new.raw_user_meta_data->>'plan', 'starter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
