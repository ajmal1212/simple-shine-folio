
-- Create storage bucket for template media
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-media', 'template-media', true);

-- Create storage policies for template media
CREATE POLICY "Allow public access to template media" ON storage.objects
FOR SELECT USING (bucket_id = 'template-media');

CREATE POLICY "Allow authenticated users to upload template media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'template-media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own template media" ON storage.objects
FOR UPDATE USING (bucket_id = 'template-media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their own template media" ON storage.objects
FOR DELETE USING (bucket_id = 'template-media' AND auth.role() = 'authenticated');

-- Fix the template status constraint to allow 'DRAFT'
ALTER TABLE whatsapp_templates DROP CONSTRAINT IF EXISTS whatsapp_templates_status_check;
ALTER TABLE whatsapp_templates ADD CONSTRAINT whatsapp_templates_status_check 
CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'));
