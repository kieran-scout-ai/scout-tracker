-- Create portfolio_holdings table to store individual stock holdings
CREATE TABLE public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  quantity DECIMAL(15,4),
  price DECIMAL(15,4),
  market_value DECIMAL(15,4),
  weight DECIMAL(5,4),
  sector TEXT,
  validated BOOLEAN DEFAULT false,
  validation_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio holdings access
CREATE POLICY "Users can view holdings for their portfolios" 
ON public.portfolio_holdings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM portfolios 
  WHERE portfolios.id = portfolio_holdings.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

CREATE POLICY "Users can insert holdings for their portfolios" 
ON public.portfolio_holdings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM portfolios 
  WHERE portfolios.id = portfolio_holdings.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

CREATE POLICY "Users can update holdings for their portfolios" 
ON public.portfolio_holdings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM portfolios 
  WHERE portfolios.id = portfolio_holdings.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

CREATE POLICY "Users can delete holdings for their portfolios" 
ON public.portfolio_holdings 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM portfolios 
  WHERE portfolios.id = portfolio_holdings.portfolio_id 
  AND portfolios.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_portfolio_holdings_updated_at
BEFORE UPDATE ON public.portfolio_holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_portfolio_holdings_portfolio_id ON public.portfolio_holdings(portfolio_id);
CREATE INDEX idx_portfolio_holdings_symbol ON public.portfolio_holdings(symbol);