import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';

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
      <Briefcase className="h-5 w-5 text-financial-blue" />
      <Select 
        value={selectedPortfolio?.id || ''} 
        onValueChange={(value) => {
          const portfolio = portfolios.find(p => p.id === value);
          if (portfolio) onPortfolioSelect(portfolio);
        }}
      >
        <SelectTrigger className="w-64 bg-financial-dark/50 border-financial-silver/30 text-financial-silver focus:border-financial-blue">
          <SelectValue placeholder="Select a portfolio">
            {selectedPortfolio && (
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-financial-blue" />
                <span className="truncate">{selectedPortfolio.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-financial-dark border-financial-silver/20">
          {portfolios.map((portfolio) => (
            <SelectItem 
              key={portfolio.id} 
              value={portfolio.id}
              className="text-financial-silver hover:bg-financial-navy/50 focus:bg-financial-navy/50"
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-financial-blue" />
                  <span className="font-medium">{portfolio.name}</span>
                </div>
                {portfolio.description && (
                  <span className="text-xs text-financial-silver/70 mt-1">
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