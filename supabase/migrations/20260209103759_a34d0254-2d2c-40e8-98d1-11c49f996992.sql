-- Create storage bucket for rewards images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('rewards', 'rewards', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public access to rewards images
CREATE POLICY "Anyone can view rewards images"
ON storage.objects FOR SELECT
USING (bucket_id = 'rewards');

-- Create policy for admin to upload rewards images
CREATE POLICY "Admins can upload rewards images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rewards' AND has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admin to update rewards images
CREATE POLICY "Admins can update rewards images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'rewards' AND has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admin to delete rewards images
CREATE POLICY "Admins can delete rewards images"
ON storage.objects FOR DELETE
USING (bucket_id = 'rewards' AND has_role(auth.uid(), 'admin'::app_role));