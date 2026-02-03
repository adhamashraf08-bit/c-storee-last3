-- Allow all authenticated users to insert and delete sales_data (for xlsx upload flow).
-- The previous migration restricted these to admin@cstore.com only, which caused 42501 on upload.

DROP POLICY IF EXISTS "Allow admin to insert sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Allow admin to delete sales data" ON public.sales_data;

CREATE POLICY "Allow authenticated to insert sales data"
ON public.sales_data FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete sales data"
ON public.sales_data FOR DELETE
TO authenticated
USING (true);
