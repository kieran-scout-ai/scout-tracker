import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { apiClient, type PortfolioHolding } from '@/lib/api';
import { toast } from '@/hooks/use-toast';


interface PortfolioHoldingsProps {
  portfolioId: string;
}

export const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({ portfolioId }) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchHoldings();
  }, [portfolioId]);

  const fetchHoldings = async () => {
    try {
      const response = await apiClient.getPortfolioHoldings(portfolioId);

      if (response.error) throw new Error(response.error);

      const data = response.data || [];
      setHoldings(data);

      // Calculate total portfolio value
      const total = data.reduce((sum, holding) => {
        return sum + (Number(holding.market_value) || 0);
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
      <CardContent className="p-6">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {holdings.map((holding) => (
              <div
                key={holding.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-foreground text-sm">{holding.symbol}</span>
                    {holding.validated ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  {holding.name && (
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {holding.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {holding.market_value && (
                    <span className="text-sm font-medium">
                      ${holding.market_value.toLocaleString()}
                    </span>
                  )}
                  {holding.weight && (
                    <Badge variant="secondary" className="text-xs">
                      {(holding.weight * 100).toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};