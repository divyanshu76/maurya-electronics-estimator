-- 001_initial_schema.sql

-- 1. Create tables
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text,
  unit text DEFAULT 'pcs',
  rate numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number text UNIQUE,
  customer_name text NOT NULL,
  customer_phone text,
  customer_address text,
  items jsonb NOT NULL,
  total_items integer DEFAULT 0,
  total_quantity numeric DEFAULT 0,
  subtotal numeric DEFAULT 0,
  grand_total numeric DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text DEFAULT 'Maurya Electronics',
  tagline text DEFAULT 'ELECTRICAL MATERIALS & SERVICES',
  phone text DEFAULT '9654922408',
  address text DEFAULT 'मुहम्मदपुर (बरहियाँ), हलधरपुर–मऊ',
  hero_image_url text,
  hero_background_url text,
  logo_url text DEFAULT '/logo.png',
  pdf_notes text,
  updated_at timestamptz DEFAULT now()
);

-- 2. Insert default business setting row
INSERT INTO business_settings (business_name) VALUES ('Maurya Electronics');

-- 3. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies

-- profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- products
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- estimates
CREATE POLICY "Anyone can create estimates"
  ON estimates FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read estimates"
  ON estimates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can delete estimates"
  ON estimates FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update estimates"
  ON estimates FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- business_settings
CREATE POLICY "Anyone can read business settings"
  ON business_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can update business settings"
  ON business_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- storage policies
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'business-assets');

CREATE POLICY "Admin can upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'business-assets' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'business-assets' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'business-assets' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
