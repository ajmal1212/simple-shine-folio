
-- Add missing fields to the contacts table to match the UI
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS total_messages integer DEFAULT 0;

-- Update existing contacts to have some default values
UPDATE contacts 
SET 
  email = COALESCE(email, name || '@email.com'),
  tags = COALESCE(tags, ARRAY['Customer']),
  country = COALESCE(country, 'Unknown'),
  source = COALESCE(source, 'Manual'),
  total_messages = COALESCE(total_messages, 0)
WHERE email IS NULL OR tags IS NULL OR country IS NULL OR source IS NULL OR total_messages IS NULL;
