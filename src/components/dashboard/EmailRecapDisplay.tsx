import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Clock, AlertCircle, Sparkles, Loader2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { apiClient, type Portfolio, type EmailRecap } from '@/lib/api';
import { toast } from '@/hooks/use-toast';


interface EmailRecapDisplayProps {
  portfolio: Portfolio;
  latestRecap: EmailRecap | null;
  onRecapGenerated?: () => void;
}

export const EmailRecapDisplay: React.FC<EmailRecapDisplayProps> = ({
  portfolio,
  latestRecap,
  onRecapGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasHoldings, setHasHoldings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkHoldings();
  }, [portfolio.id]);

  const checkHoldings = async () => {
    try {
      const response = await apiClient.getPortfolioHoldings(portfolio.id);

      if (response.error) {
        // If error, assume no holdings
        setHasHoldings(false);
        return;
      }

      setHasHoldings(response.data && response.data.length > 0);
    } catch (error) {
      console.error('Error checking holdings:', error);
    }
  };

  const generateRecap = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.generateRecap(portfolio.id);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `Generated new recap: ${response.data?.subject}`,
      });

      if (onRecapGenerated) {
        onRecapGenerated();
      }
    } catch (error) {
      console.error('Error generating recap:', error);
      toast({
        title: "Error",
        description: "Failed to generate portfolio recap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!latestRecap) {
    return (
      <div>
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-accent" />
                  <span>{portfolio.name}</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {portfolio.description || 'No description provided'}
                </CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className="text-accent border-accent/50 bg-accent/10"
              >
                {portfolio.email_frequency.charAt(0).toUpperCase() + portfolio.email_frequency.slice(1)} Updates
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {hasHoldings ? "No Email Recaps Yet" : "No Portfolio Holdings"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasHoldings 
                    ? `Generate your first ${portfolio.email_frequency} recap based on your portfolio holdings and preferences.`
                    : "Upload your portfolio holdings to start receiving personalized market recaps and insights."
                  }
                </p>
              </div>
              
              {hasHoldings ? (
                <Button 
                  onClick={generateRecap}
                  disabled={isGenerating}
                  className="bg-accent hover:bg-accent/80 text-accent-foreground"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Recap...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate First Recap
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate(`/upload-holdings/${portfolio.id}`)}
                  className="bg-accent hover:bg-accent/80 text-accent-foreground"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Portfolio Holdings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Mail className="h-5 w-5 text-accent" />
                <span>{portfolio.name}</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {portfolio.description || 'No description provided'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge 
                variant="outline" 
                className="text-accent border-accent/50 bg-accent/10"
              >
                {portfolio.email_frequency.charAt(0).toUpperCase() + portfolio.email_frequency.slice(1)} Updates
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Last update: {format(new Date(latestRecap.sent_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Latest Email Recap */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-xl">
                {latestRecap.subject}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sent on {format(new Date(latestRecap.sent_at), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
              </CardDescription>
            </div>
            <Button 
              onClick={generateRecap}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="text-accent border-accent/50 hover:bg-accent/10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate New
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-invert max-w-none text-muted-foreground"
            style={{ 
              lineHeight: '1.7'
            }}
          >
            <div className="whitespace-pre-wrap">
              {latestRecap.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};