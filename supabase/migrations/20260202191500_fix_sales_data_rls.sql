-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can select sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Authenticated users can insert sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Authenticated users can update sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Authenticated users can delete sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow public read access" ON public.sales_data;
DROP POLICY IF EXISTS "Allow public insert access" ON public.sales_data;
DROP POLICY IF EXISTS "Allow public delete access" ON public.sales_data;
DROP POLICY IF EXISTS "Allow authenticated to read sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow admin to insert sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow admin to update sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow admin to delete sales data" ON public.sales_data;

-- Re-enable RLS just in case
ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read sales data
CREATE POLICY "Allow authenticated to read sales data"
ON public.sales_data FOR SELECT
TO authenticated
USING (true);

-- Allow admin to insert sales data (case-insensitive email check)
CREATE POLICY "Allow admin to insert sales data"
ON public.sales_data FOR INSERT
TO authenticated
WITH CHECK (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com');

-- Allow admin to update sales data
CREATE POLICY "Allow admin to update sales data"
ON public.sales_data FOR UPDATE
TO authenticated
USING (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com')
WITH CHECK (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com');

-- Allow admin to delete sales data
CREATE POLICY "Allow admin to delete sales data"
ON public.sales_data FOR DELETE
TO authenticated
USING (LOWER(auth.jwt() ->> 'email') = 'admin@cstore.com');

-- Grant permissions to authenticated role
GRANT ALL ON public.sales_data TO authenticated;
