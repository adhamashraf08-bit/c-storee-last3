-- Create branch_targets table for storing monthly sales targets per branch
CREATE TABLE IF NOT EXISTS branch_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_name TEXT NOT NULL CHECK (branch_name IN ('Dark Store', 'Maadi', 'Masr El Gededa', 'Tagamo3')),
  target_value NUMERIC NOT NULL DEFAULT 0 CHECK (target_value >= 0),
  month TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(branch_name, month)
);

-- Create index for fast month lookups
CREATE INDEX IF NOT EXISTS idx_branch_targets_month ON branch_targets(month);

-- Create index for branch lookups  
CREATE INDEX IF NOT EXISTS idx_branch_targets_branch ON branch_targets(branch_name);

-- Add RLS policies
ALTER TABLE branch_targets ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read targets
CREATE POLICY "Allow authenticated users to read targets"
  ON branch_targets FOR SELECT
  TO authenticated
  USING (true);

-- Only allow authenticated users with admin email to insert/update targets
CREATE POLICY "Allow admin to insert targets"
  ON branch_targets FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@cstore.com'
  );

CREATE POLICY "Allow admin to update targets"
  ON branch_targets FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'admin@cstore.com'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@cstore.com'
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_branch_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER branch_targets_updated_at
  BEFORE UPDATE ON branch_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_branch_targets_updated_at();
