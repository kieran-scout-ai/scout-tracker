import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  email_instructions: string;
  email_frequency: string;
  created_at: string;
}

interface EmailRecap {
  id: string;
  subject: string;
  content: string;
  sent_at: string;
}

interface EmailRecapDisplayProps {
  portfolio: Portfolio;
  latestRecap: EmailRecap | null;
}

export const EmailRecapDisplay: React.FC<EmailRecapDisplayProps> = ({
  portfolio,
  latestRecap
}) => {
  if (!latestRecap) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-financial-dark/30 border-financial-silver/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-financial-silver flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-financial-blue" />
                  <span>{portfolio.name}</span>
                </CardTitle>
                <CardDescription className="text-financial-silver/70 mt-2">
                  {portfolio.description || 'No description provided'}
                </CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className="text-financial-blue border-financial-blue/50 bg-financial-blue/10"
              >
                {portfolio.email_frequency} updates
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="h-12 w-12 text-financial-silver/50 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-financial-silver mb-2">
                  No Email Recaps Yet
                </h3>
                <p className="text-financial-silver/70 max-w-md mx-auto">
                  Your first {portfolio.email_frequency} recap will be generated soon based on your portfolio holdings and preferences.
                </p>
              </div>
              {portfolio.email_instructions && (
                <div className="mt-6 p-4 bg-financial-navy/30 rounded-lg border border-financial-silver/10">
                  <h4 className="text-sm font-medium text-financial-silver mb-2">Your Instructions:</h4>
                  <p className="text-sm text-financial-silver/80">{portfolio.email_instructions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Portfolio Header */}
      <Card className="bg-financial-dark/30 border-financial-silver/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-financial-silver flex items-center space-x-2">
                <Mail className="h-5 w-5 text-financial-blue" />
                <span>{portfolio.name}</span>
              </CardTitle>
              <CardDescription className="text-financial-silver/70 mt-2">
                {portfolio.description || 'No description provided'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge 
                variant="outline" 
                className="text-financial-blue border-financial-blue/50 bg-financial-blue/10"
              >
                {portfolio.email_frequency} updates
              </Badge>
              <div className="flex items-center text-sm text-financial-silver/70">
                <Clock className="h-4 w-4 mr-1" />
                Last update: {format(new Date(latestRecap.sent_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Latest Email Recap */}
      <Card className="bg-financial-dark/30 border-financial-silver/20">
        <CardHeader>
          <CardTitle className="text-financial-silver text-xl">
            {latestRecap.subject}
          </CardTitle>
          <CardDescription className="text-financial-silver/70">
            Sent on {format(new Date(latestRecap.sent_at), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-invert max-w-none text-financial-silver/90"
            style={{ 
              color: 'hsl(var(--financial-silver))',
              lineHeight: '1.7'
            }}
          >
            {/* For now, display as plain text. In production, this would be formatted HTML */}
            <div className="whitespace-pre-wrap">
              {latestRecap.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Instructions */}
      {portfolio.email_instructions && (
        <Card className="bg-financial-navy/20 border-financial-blue/30">
          <CardHeader>
            <CardTitle className="text-financial-blue text-lg">Your Coverage Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-financial-silver/90 leading-relaxed">
              {portfolio.email_instructions}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};