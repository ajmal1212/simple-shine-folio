
-- Create campaigns table to store broadcast campaign data
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  template_name TEXT,
  template_id UUID,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own campaigns
CREATE POLICY "Users can view their own campaigns" 
  ON public.campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own campaigns
CREATE POLICY "Users can create their own campaigns" 
  ON public.campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own campaigns
CREATE POLICY "Users can update their own campaigns" 
  ON public.campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own campaigns
CREATE POLICY "Users can delete their own campaigns" 
  ON public.campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);
