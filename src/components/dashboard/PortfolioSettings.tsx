import React, { useState } from 'react';
import { apiClient, type Portfolio } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Save, Mail, Settings2, Trash2 } from 'lucide-react';


interface PortfolioSettingsProps {
  portfolio: Portfolio;
  onUpdate: (updatedPortfolio: Portfolio) => void;
  onDelete?: () => void;
}

export const PortfolioSettings: React.FC<PortfolioSettingsProps> = ({
  portfolio,
  onUpdate,
  onDelete
}) => {
  const [emailInstructions, setEmailInstructions] = useState(portfolio.email_instructions || '');
  const [emailFrequency, setEmailFrequency] = useState(portfolio.email_frequency || 'weekly');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiClient.updatePortfolio(portfolio.id, {
        email_instructions: emailInstructions,
        email_frequency: emailFrequency
      });

      if (response.error) throw new Error(response.error);

      onUpdate(response.data!);
      toast({
        title: "Success",
        description: "Portfolio settings updated successfully"
      });
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

  const handleDelete = async () => {
    if (deleteConfirmName !== portfolio.name) {
      toast({
        title: "Error",
        description: "Portfolio name doesn't match",
        variant: "destructive"
      });
      return;
    }

    setDeleting(true);
    try {
      // Delete the portfolio (cascading delete will handle holdings and recaps)
      const response = await apiClient.deletePortfolio(portfolio.id);

      if (response.error) throw new Error(response.error);

      toast({
        title: "Success",
        description: "Portfolio deleted successfully"
      });

      onDelete?.();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmName('');
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

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center space-x-2">
            <Trash2 className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Once you delete a portfolio, there is no going back. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Portfolio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>This action cannot be undone. This will permanently delete your portfolio and all associated data including:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All portfolio holdings</li>
                    <li>Email recap history</li>
                    <li>Portfolio settings and configurations</li>
                  </ul>
                  <p className="font-medium">Please type <span className="font-mono bg-muted px-1 rounded">{portfolio.name}</span> to confirm deletion:</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4">
                <Input
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={`Type "${portfolio.name}" to confirm`}
                  className="font-mono"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmName('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={deleteConfirmName !== portfolio.name || deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'Deleting...' : 'Delete Portfolio'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};