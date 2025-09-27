import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PortfolioData {
  id: string;
  name: string;
  description: string | null;
  email_instructions: string;
  email_frequency: string;
  created_at: string;
}

interface PortfolioSelectorProps {
  portfolios: PortfolioData[];
  selectedPortfolio: PortfolioData | null;
  onPortfolioSelect: (portfolio: PortfolioData) => void;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({
  portfolios,
  selectedPortfolio,
  onPortfolioSelect
}) => {
  return (
    <div className="flex items-center space-x-3">
      <Select 
        value={selectedPortfolio?.id || ''} 
        onValueChange={(value) => {
          const portfolio = portfolios.find(p => p.id === value);
          if (portfolio) onPortfolioSelect(portfolio);
        }}
      >
        <SelectTrigger className="w-64 bg-card border-border focus:border-accent">
          <SelectValue placeholder="Select a portfolio">
            {selectedPortfolio && (
              <div className="flex items-center space-x-2">
                <span className="truncate">{selectedPortfolio.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          {portfolios.map((portfolio) => (
            <SelectItem 
              key={portfolio.id} 
              value={portfolio.id}
              className="hover:bg-accent/10 focus:bg-accent/10"
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{portfolio.name}</span>
                </div>
                {portfolio.description && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {portfolio.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};