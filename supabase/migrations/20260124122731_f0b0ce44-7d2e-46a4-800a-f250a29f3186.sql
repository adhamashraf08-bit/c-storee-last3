-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public read access" ON public.sales_data;
DROP POLICY IF EXISTS "Allow public insert access" ON public.sales_data;
DROP POLICY IF EXISTS "Allow public delete access" ON public.sales_data;

-- Create authenticated-only policies
CREATE POLICY "Authenticated users can read sales data"
ON public.sales_data
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sales data"
ON public.sales_data
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales data"
ON public.sales_data
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete sales data"
ON public.sales_data
FOR DELETE
TO authenticated
USING (true);