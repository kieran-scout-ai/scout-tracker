import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Upload as UploadIcon, ArrowLeft, FileSpreadsheet, FileText, Loader2, Eye, CheckCircle } from 'lucide-react';

interface FilePreviewData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

interface ColumnMapping {
  nameColumn: number | null;
  tickerColumn: number | null;
}

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
}

const UploadHoldings = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreviewData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ nameColumn: null, tickerColumn: null });
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && portfolioId) {
      fetchPortfolio();
    }
  }, [user, portfolioId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };

  const fetchPortfolio = async () => {
    if (!portfolioId) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, name, description')
        .eq('id', portfolioId)
        .single();

      if (error) throw error;
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolio details",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  };

  const parseCSVContent = (csvContent: string): FilePreviewData => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('File must have at least a header row and one data row');
    }

    // Parse CSV, handling quoted values
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/['"]/g, '').toLowerCase());
    const rows = lines.slice(1, Math.min(6, lines.length)).map(line => parseCSVLine(line));

    return { headers, rows, fileName: file?.name || 'file' };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        
        // Only parse CSV files for preview (Excel files would need additional library)
        if (fileName.endsWith('.csv')) {
          try {
            const text = await selectedFile.text();
            const preview = parseCSVContent(text);
            setFilePreview(preview);
            
            // Auto-detect column mappings
            const nameIndex = preview.headers.findIndex(h => 
              h.includes('name') || h.includes('company') || h.includes('security')
            );
            const tickerIndex = preview.headers.findIndex(h => 
              h.includes('ticker') || h.includes('symbol') || h.includes('code')
            );
            
            setColumnMapping({
              nameColumn: nameIndex >= 0 ? nameIndex : null,
              tickerColumn: tickerIndex >= 0 ? tickerIndex : null
            });
          } catch (error: any) {
            toast({
              title: "File parsing error",
              description: error.message,
              variant: "destructive"
            });
            setFile(null);
            setFilePreview(null);
          }
        } else {
          // For Excel files, we'll process them on the backend
          setFilePreview(null);
          setColumnMapping({ nameColumn: null, tickerColumn: null });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid spreadsheet file (.xlsx, .xls, or .csv)",
          variant: "destructive"
        });
      }
    }
  };

  const handlePreviewNext = () => {
    if (!file) return;
    
    if (filePreview && (columnMapping.nameColumn === null || columnMapping.tickerColumn === null)) {
      toast({
        title: "Column mapping required",
        description: "Please select which columns contain the Name and Ticker information",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep('preview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !portfolio || !file) return;

    setLoading(true);

    try {
      setUploadingFile(true);
      
      // Upload file to storage with user-specific path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${portfolio.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update portfolio with file path
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({ file_path: fileName })
        .eq('id', portfolio.id);

      if (updateError) throw updateError;

      // Process and verify the uploaded file with column mapping
      const { error: processError } = await supabase.functions.invoke('process-portfolio-file', {
        body: { 
          portfolio_id: portfolio.id,
          file_path: fileName,
          column_mapping: filePreview ? columnMapping : null
        }
      });

      if (processError) {
        console.error('Processing error:', processError);
        toast({
          title: "File uploaded but processing failed",
          description: "Your holdings file was uploaded but couldn't be processed. You can try uploading again later.",
          variant: "destructive"
        });
      }

      // Trigger holdings verification
      const { error: verifyError } = await supabase.functions.invoke('verify-holdings', {
        body: { 
          portfolio_id: portfolio.id,
          file_path: fileName
        }
      });

      if (verifyError) {
        console.error('Verification error:', verifyError);
      }

      toast({
        title: "Holdings updated!",
        description: "Your portfolio holdings have been uploaded and processed successfully.",
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

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card-secondary to-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground">Upload Holdings</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Update holdings for <span className="font-semibold text-foreground">{portfolio.name}</span>
            </p>
          </div>
        </div>

        {/* Step 1: Upload Form */}
        {currentStep === 'upload' && (
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="w-5 h-5 text-accent" />
                Upload Portfolio Holdings
              </CardTitle>
              <CardDescription>
                Upload a new spreadsheet with your updated portfolio holdings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                    Upload a spreadsheet (.xlsx, .xls, or .csv) with your portfolio holdings. This will replace all existing holdings for this portfolio.
                  </p>
                </div>

                {/* File Preview and Column Mapping for CSV files */}
                {filePreview && (
                  <div className="space-y-4 p-4 bg-card-secondary rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-accent" />
                      <Label className="text-sm font-medium">File Preview & Column Mapping</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nameColumn">Name Column *</Label>
                        <Select 
                          value={columnMapping.nameColumn?.toString() || ""} 
                          onValueChange={(value) => setColumnMapping(prev => ({ ...prev, nameColumn: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select name column" />
                          </SelectTrigger>
                          <SelectContent>
                            {filePreview.headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {header} (Column {index + 1})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tickerColumn">Ticker Column *</Label>
                        <Select 
                          value={columnMapping.tickerColumn?.toString() || ""} 
                          onValueChange={(value) => setColumnMapping(prev => ({ ...prev, tickerColumn: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ticker column" />
                          </SelectTrigger>
                          <SelectContent>
                            {filePreview.headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {header} (Column {index + 1})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {filePreview.headers.map((header, index) => (
                              <TableHead key={index} className={`text-xs ${
                                index === columnMapping.nameColumn ? 'bg-accent/20' : 
                                index === columnMapping.tickerColumn ? 'bg-accent-light/20' : ''
                              }`}>
                                {header}
                                {index === columnMapping.nameColumn && <span className="ml-1 text-accent">📝</span>}
                                {index === columnMapping.tickerColumn && <span className="ml-1 text-accent-light">🎯</span>}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filePreview.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className={`text-xs ${
                                  cellIndex === columnMapping.nameColumn ? 'bg-accent/5' : 
                                  cellIndex === columnMapping.tickerColumn ? 'bg-accent-light/5' : ''
                                }`}>
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

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
                    type="button"
                    onClick={handlePreviewNext}
                    disabled={!file}
                    className="flex-1"
                  >
                    Next: Review & Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview and Confirm */}
        {currentStep === 'preview' && (
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Review & Confirm Upload
              </CardTitle>
              <CardDescription>
                Review your upload details before processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-card-secondary rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Portfolio</Label>
                    <p className="font-medium">{portfolio.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">File</Label>
                    <p className="font-medium">{file?.name}</p>
                  </div>
                </div>

                {filePreview && (
                  <div className="p-4 bg-card-secondary rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Column Mapping</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name Column:</span> {filePreview.headers[columnMapping.nameColumn!]}
                      </div>
                      <div>
                        <span className="font-medium">Ticker Column:</span> {filePreview.headers[columnMapping.tickerColumn!]}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Warning:</strong> This will replace all existing holdings in your portfolio with the new data from your file.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep('upload')}
                      className="flex-1"
                      disabled={loading || uploadingFile}
                    >
                      Back to Edit
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || uploadingFile}
                      className="flex-1"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing File...
                        </>
                      ) : loading ? (
                        'Updating...'
                      ) : (
                        'Update Holdings'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadHoldings;