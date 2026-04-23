-- Schéma de base pour le SaaS Artisan Management

-- 1. Table des profils (artisans)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT NOT NULL,
  siret TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Sécurisation des données
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Les artisans ne voient que LEURS propres données
CREATE POLICY "Artisans can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Artisans can view own clients" ON clients FOR SELECT USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can view own documents" ON documents FOR SELECT USING (auth.uid() = artisan_id);
