import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Save, Mail, Settings2 } from 'lucide-react';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  email_instructions: string;
  email_frequency: string;
  created_at: string;
}

interface PortfolioSettingsProps {
  portfolio: Portfolio;
  onUpdate: (updatedPortfolio: Portfolio) => void;
}

export const PortfolioSettings: React.FC<PortfolioSettingsProps> = ({
  portfolio,
  onUpdate
}) => {
  const [emailInstructions, setEmailInstructions] = useState(portfolio.email_instructions || '');
  const [emailFrequency, setEmailFrequency] = useState(portfolio.email_frequency || 'weekly');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update({
          email_instructions: emailInstructions,
          email_frequency: emailFrequency
        })
        .eq('id', portfolio.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Frequency */}
      <Card className="bg-financial-navy/30 border-financial-silver/20">
        <CardHeader>
          <CardTitle className="text-financial-silver flex items-center space-x-2">
            <Mail className="h-5 w-5 text-financial-blue" />
            <span>Email Frequency</span>
          </CardTitle>
          <CardDescription className="text-financial-silver/70">
            Choose how often you'd like to receive portfolio updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={emailFrequency} onValueChange={setEmailFrequency}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="text-financial-silver cursor-pointer">
                  <div>
                    <div className="font-medium">Daily Updates</div>
                    <div className="text-sm text-financial-silver/70">
                      Receive updates every trading day
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="text-financial-silver cursor-pointer">
                  <div>
                    <div className="font-medium">Weekly Updates</div>
                    <div className="text-sm text-financial-silver/70">
                      Receive a comprehensive weekly summary
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Email Instructions */}
      <Card className="bg-financial-navy/30 border-financial-silver/20">
        <CardHeader>
          <CardTitle className="text-financial-silver flex items-center space-x-2">
            <Settings2 className="h-5 w-5 text-financial-blue" />
            <span>Coverage Instructions</span>
          </CardTitle>
          <CardDescription className="text-financial-silver/70">
            Provide specific instructions on what you'd like included in your email updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={emailInstructions}
            onChange={(e) => setEmailInstructions(e.target.value)}
            placeholder="Example: Focus on market announcements, macro events, political developments that could impact my holdings. Include earnings previews and analyst upgrades/downgrades. Highlight any significant options activity or insider trading."
            rows={6}
            className="bg-financial-dark/50 border-financial-silver/30 text-financial-silver placeholder:text-financial-silver/50 focus:border-financial-blue resize-none"
          />
          <div className="mt-2 text-sm text-financial-silver/60">
            Be specific about what market events, news categories, and analysis you want included in your updates.
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-financial-blue hover:bg-financial-blue/80 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};