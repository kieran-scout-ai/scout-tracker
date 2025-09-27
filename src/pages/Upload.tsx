import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload as UploadIcon, ArrowLeft, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

const Upload = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emailInstructions: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();
      
      // Check if it's a valid spreadsheet file
      if (fileType.includes('spreadsheet') || 
          fileType.includes('excel') || 
          fileName.endsWith('.xlsx') || 
          fileName.endsWith('.xls') || 
          fileName.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid spreadsheet file (.xlsx, .xls, or .csv)",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create portfolio first
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          email_instructions: formData.emailInstructions,
          email_frequency: 'weekly'
        })
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Upload and process the required file
      if (!file) {
        throw new Error("Portfolio file is required");
      }

      setUploadingFile(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${portfolio.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update portfolio with file path
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({ file_path: fileName })
        .eq('id', portfolio.id);

      if (updateError) throw updateError;

      // Process the uploaded file
      const { error: processError } = await supabase.functions.invoke('process-portfolio-file', {
        body: { 
          portfolio_id: portfolio.id,
          file_path: fileName
        }
      });

      if (processError) {
        console.error('Processing error:', processError);
        toast({
          title: "File uploaded but processing failed",
          description: "Your portfolio was created but the file couldn't be processed. You can try uploading again later.",
          variant: "destructive"
        });
      }

      toast({
        title: "Portfolio created!",
        description: "Your portfolio and spreadsheet have been uploaded successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card-secondary to-background">
      <div className="container max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-2xl flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Create New Portfolio</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Set up your portfolio details and preferences for AI-powered market coverage
            </p>
          </div>
        </div>

        {/* Upload Form */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-accent" />
              Portfolio Information
            </CardTitle>
            <CardDescription>
              Provide details about your portfolio to receive personalized market insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Portfolio Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Tech Growth Portfolio"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your portfolio strategy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioFile">Portfolio Spreadsheet *</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="portfolioFile"
                    type="file"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    className="flex-1"
                    required
                  />
                  {file && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a spreadsheet (.xlsx, .xls, or .csv) with your portfolio holdings. The file will be validated against our security master database.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailInstructions">Email Recap Instructions *</Label>
                <Textarea
                  id="emailInstructions"
                  value={formData.emailInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailInstructions: e.target.value }))}
                  placeholder="Describe what kind of insights and analysis you'd like to receive in your email recaps..."
                  rows={4}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Tell us what type of analysis, metrics, and insights matter most to you
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || uploadingFile || !formData.name || !formData.emailInstructions || !file}
                  className="flex-1"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing File...
                    </>
                  ) : loading ? (
                    'Creating...'
                  ) : (
                    'Create Portfolio'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;