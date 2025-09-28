import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Settings, FileText, Plus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioSelector } from '@/components/dashboard/PortfolioSelector';
import { EmailRecapDisplay } from '@/components/dashboard/EmailRecapDisplay';
import { PortfolioSettings } from '@/components/dashboard/PortfolioSettings';
import { PortfolioHoldings } from '@/components/dashboard/PortfolioHoldings';
import { ScoutLogo } from '@/components/ScoutLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [latestRecap, setLatestRecap] = useState<EmailRecap | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPortfolio) {
      fetchLatestRecap();
    }
  }, [selectedPortfolio]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPortfolios(data || []);
      if (data && data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0]);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestRecap = async () => {
    if (!selectedPortfolio) return;

    try {
      const { data, error } = await supabase
        .from('email_recaps')
        .select('*')
        .eq('portfolio_id', selectedPortfolio.id)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      setLatestRecap(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching latest recap:', error);
      toast({
        title: "Error",
        description: "Failed to fetch latest recap",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePortfolioUpdate = (updatedPortfolio: Portfolio) => {
    setPortfolios(prev => prev.map(p => 
      p.id === updatedPortfolio.id ? updatedPortfolio : p
    ));
    setSelectedPortfolio(updatedPortfolio);
    setIsSettingsOpen(false);
  };

  const handlePortfolioDelete = () => {
    setIsSettingsOpen(false);
    setSelectedPortfolio(null);
    fetchPortfolios();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card-secondary to-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    );
  }

  if (portfolios.length === 0) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card-secondary to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <ScoutLogo size="md" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border z-50">
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center space-y-6 max-w-md">
          <FileText className="h-16 w-16 text-accent mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">No Portfolios Yet</h2>
          <p className="text-muted-foreground">
            Get started by creating your first portfolio to receive tailored market coverage.
          </p>
          <Button 
            onClick={() => navigate('/upload')} 
            variant="hero"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card-secondary to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <ScoutLogo size="md" />
            <PortfolioSelector 
              portfolios={portfolios}
              selectedPortfolio={selectedPortfolio}
              onPortfolioSelect={setSelectedPortfolio}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {selectedPortfolio && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Portfolio Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Portfolio Settings</DialogTitle>
                  </DialogHeader>
                  <PortfolioSettings 
                    portfolio={selectedPortfolio}
                    onUpdate={handlePortfolioUpdate}
                    onDelete={handlePortfolioDelete}
                  />
                </DialogContent>
              </Dialog>
            )}

            <Button 
              onClick={() => navigate('/upload')} 
              variant="hero"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Portfolio
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border z-50">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {selectedPortfolio ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Instructions */}
              {selectedPortfolio.email_instructions && (
                <div className="bg-card/50 border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Your Coverage Instructions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedPortfolio.email_instructions}
                  </p>
                </div>
              )}
              
              <EmailRecapDisplay 
                portfolio={selectedPortfolio}
                latestRecap={latestRecap}
                onRecapGenerated={fetchLatestRecap}
              />
            </div>
            <div className="lg:col-span-1">
              <PortfolioHoldings portfolioId={selectedPortfolio.id} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select a portfolio to view its latest recap</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;