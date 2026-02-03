-- =============================================================================
-- Run this entire file in your NEW Supabase project (SQL Editor) to create
-- all tables and policies. Order: sales_data → policies → branch_targets.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. sales_data table (from 20260124122041)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    branch_name TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    sales_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    orders_count INTEGER NOT NULL DEFAULT 0,
    target_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_data_date ON public.sales_data(date);
CREATE INDEX IF NOT EXISTS idx_sales_data_branch ON public.sales_data(branch_name);
CREATE INDEX IF NOT EXISTS idx_sales_data_channel ON public.sales_data(channel_name);

ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_sales_data_updated_at ON public.sales_data;
CREATE TRIGGER update_sales_data_updated_at
BEFORE UPDATE ON public.sales_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- sales_data RLS: final state (authenticated read; authenticated insert/delete; admin update)
DROP POLICY IF EXISTS "Allow public read access" ON public.sales_data;
DROP POLICY IF EXISTS "Allow public insert access" ON public.sales_data;
DROP POLICY IF EXISTS "Allow public delete access" ON public.sales_data;
DROP POLICY IF EXISTS "Authenticated users can select sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Authenticated users can insert sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Authenticated users can update sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Authenticated users can delete sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow authenticated to read sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow admin to insert sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow admin to update sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow admin to delete sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow authenticated to insert sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow authenticated to delete sales data" ON public.sales_data;

CREATE POLICY "Allow authenticated to read sales data"
ON public.sales_data FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to insert sales data"
ON public.sales_data FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete sales data"
ON public.sales_data FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow admin to update sales data"
ON public.sales_data FOR UPDATE TO authenticated
USING (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com')
WITH CHECK (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com');

GRANT ALL ON public.sales_data TO authenticated;

-- -----------------------------------------------------------------------------
-- 2. branch_targets table (from create_branch_targets.sql)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branch_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_name TEXT NOT NULL CHECK (branch_name IN ('Dark Store', 'Maadi', 'Masr El Gededa', 'Tagamo3')),
  target_value NUMERIC NOT NULL DEFAULT 0 CHECK (target_value >= 0),
  month TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(branch_name, month)
);

CREATE INDEX IF NOT EXISTS idx_branch_targets_month ON public.branch_targets(month);
CREATE INDEX IF NOT EXISTS idx_branch_targets_branch ON public.branch_targets(branch_name);

ALTER TABLE public.branch_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read targets" ON public.branch_targets;
DROP POLICY IF EXISTS "Allow admin to insert targets" ON public.branch_targets;
DROP POLICY IF EXISTS "Allow admin to update targets" ON public.branch_targets;

CREATE POLICY "Allow authenticated users to read targets"
  ON public.branch_targets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to insert targets"
  ON public.branch_targets FOR INSERT TO authenticated
  WITH CHECK (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com');

CREATE POLICY "Allow admin to update targets"
  ON public.branch_targets FOR UPDATE TO authenticated
  USING (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com')
  WITH CHECK (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com');

CREATE OR REPLACE FUNCTION public.update_branch_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS branch_targets_updated_at ON public.branch_targets;
CREATE TRIGGER branch_targets_updated_at
  BEFORE UPDATE ON public.branch_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_branch_targets_updated_at();

GRANT ALL ON public.branch_targets TO authenticated;
