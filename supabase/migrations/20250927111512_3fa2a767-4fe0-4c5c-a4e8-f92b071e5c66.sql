-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  email_instructions TEXT DEFAULT '',
  email_frequency TEXT DEFAULT 'weekly' CHECK (email_frequency IN ('daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolios
CREATE POLICY "Users can view their own portfolios" 
ON public.portfolios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios" 
ON public.portfolios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" 
ON public.portfolios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" 
ON public.portfolios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create email_recaps table
CREATE TABLE public.email_recaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email_recaps
ALTER TABLE public.email_recaps ENABLE ROW LEVEL SECURITY;

-- Create policies for email_recaps
CREATE POLICY "Users can view their own email recaps" 
ON public.email_recaps 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.id = email_recaps.portfolio_id 
    AND portfolios.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create email recaps for their portfolios" 
ON public.email_recaps 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.id = email_recaps.portfolio_id 
    AND portfolios.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_email_recaps_portfolio_sent_at ON public.email_recaps(portfolio_id, sent_at DESC);

-- Create update trigger for portfolios
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for portfolio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolios', 'portfolios', false);

-- Create storage policies
CREATE POLICY "Users can upload their own portfolio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own portfolio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own portfolio files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own portfolio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);