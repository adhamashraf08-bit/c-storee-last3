-- Create sales_data table for storing uploaded Excel data
CREATE TABLE public.sales_data (
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

-- Create index for faster queries
CREATE INDEX idx_sales_data_date ON public.sales_data(date);
CREATE INDEX idx_sales_data_branch ON public.sales_data(branch_name);
CREATE INDEX idx_sales_data_channel ON public.sales_data(channel_name);

-- Enable RLS (but allow public access for this dashboard)
ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access (dashboard is open)
CREATE POLICY "Allow public read access"
ON public.sales_data
FOR SELECT
USING (true);

-- Allow public insert access (for Excel uploads)
CREATE POLICY "Allow public insert access"
ON public.sales_data
FOR INSERT
WITH CHECK (true);

-- Allow public delete access (for data refresh)
CREATE POLICY "Allow public delete access"
ON public.sales_data
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sales_data_updated_at
BEFORE UPDATE ON public.sales_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();