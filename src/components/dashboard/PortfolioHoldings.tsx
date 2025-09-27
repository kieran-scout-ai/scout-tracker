import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Holding {
  id: string;
  symbol: string;
  name: string | null;
  quantity: number | null;
  price: number | null;
  market_value: number | null;
  weight: number | null;
  sector: string | null;
  validated: boolean;
  validation_status: string | null;
}

interface PortfolioHoldingsProps {
  portfolioId: string;
}

export const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({ portfolioId }) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchHoldings();
  }, [portfolioId]);

  const fetchHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('symbol');

      if (error) throw error;

      setHoldings(data || []);
      
      // Calculate total portfolio value
      const total = (data || []).reduce((sum, holding) => {
        return sum + (holding.market_value || 0);
      }, 0);
      setTotalValue(total);

    } catch (error) {
      console.error('Error fetching holdings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolio holdings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span>Portfolio Holdings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span>Portfolio Holdings</span>
          </CardTitle>
          <CardDescription>
            Upload a portfolio spreadsheet to see your holdings here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              No holdings found. Upload a portfolio file to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validHoldings = holdings.filter(h => h.validated);
  const invalidHoldings = holdings.filter(h => !h.validated);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <span>Portfolio Holdings</span>
        </CardTitle>
        <CardDescription>
          {holdings.length} securities • {validHoldings.length} validated
          {totalValue > 0 && (
            <span className="ml-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} total value
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ScrollArea className="h-full">
          <div className="space-y-3">
            {holdings.map((holding) => (
              <div
                key={holding.id}
                className="p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-foreground">{holding.symbol}</span>
                      {holding.validated ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    
                    {holding.name && (
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {holding.name}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {holding.sector && (
                        <Badge variant="secondary" className="text-xs">
                          {holding.sector}
                        </Badge>
                      )}
                      
                      {!holding.validated && (
                        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200">
                          Unvalidated
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    {holding.quantity && (
                      <div className="text-sm font-medium">
                        {holding.quantity.toLocaleString()} shares
                      </div>
                    )}
                    
                    {holding.market_value && (
                      <div className="text-sm text-muted-foreground">
                        ${holding.market_value.toLocaleString()}
                      </div>
                    )}
                    
                    {holding.weight && (
                      <div className="text-xs text-accent">
                        {(holding.weight * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                
                {!holding.validated && holding.validation_status && (
                  <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    {holding.validation_status}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};