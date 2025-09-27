import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Settings, FileText, Plus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioSelector } from '@/components/dashboard/PortfolioSelector';
import { EmailRecapDisplay } from '@/components/dashboard/EmailRecapDisplay';
import { PortfolioSettings } from '@/components/dashboard/PortfolioSettings';
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
    toast({
      title: "Success",
      description: "Portfolio settings updated successfully"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-financial-navy via-financial-dark to-financial-midnight flex items-center justify-center">
        <div className="animate-pulse text-financial-silver">Loading your dashboard...</div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-financial-navy via-financial-dark to-financial-midnight">
        <header className="border-b border-financial-silver/20 bg-financial-navy/50 backdrop-blur-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-financial-silver">Scout Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-financial-silver hover:text-financial-blue">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center space-y-6 max-w-md">
            <FileText className="h-16 w-16 text-financial-blue mx-auto" />
            <h2 className="text-2xl font-bold text-financial-silver">No Portfolios Yet</h2>
            <p className="text-financial-silver/70">
              Get started by creating your first portfolio to receive tailored market coverage.
            </p>
            <Button 
              onClick={() => navigate('/upload')} 
              className="bg-financial-blue hover:bg-financial-blue/80 text-white"
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
    <div className="min-h-screen bg-gradient-to-br from-financial-navy via-financial-dark to-financial-midnight">
      {/* Header */}
      <header className="border-b border-financial-silver/20 bg-financial-navy/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
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
                  <Button variant="outline" size="sm" className="text-financial-silver border-financial-silver/30 hover:bg-financial-silver/10">
                    <Settings className="h-4 w-4 mr-2" />
                    Portfolio Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-financial-dark border-financial-silver/20 text-financial-silver max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-financial-silver">Portfolio Settings</DialogTitle>
                  </DialogHeader>
                  <PortfolioSettings 
                    portfolio={selectedPortfolio}
                    onUpdate={handlePortfolioUpdate}
                  />
                </DialogContent>
              </Dialog>
            )}

            <Button 
              onClick={() => navigate('/upload')} 
              variant="secondary"
              size="sm"
              className="bg-financial-blue hover:bg-financial-blue/80 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Portfolio
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-financial-silver hover:text-financial-blue">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
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
          <EmailRecapDisplay 
            portfolio={selectedPortfolio}
            latestRecap={latestRecap}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-financial-silver/70">Select a portfolio to view its latest recap</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;