import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart3, Mail, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card-secondary to-background flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Scout</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/pricing'}
            >
              Pricing
            </Button>
            <Button 
              variant="hero"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center px-6 py-12">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Institutional-level
                  <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent"> stock coverage</span>
                  <span className="block">for everyone</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Transform your spreadsheets into professional portfolio analysis with AI-powered insights and automated email recaps.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg px-8 py-4"
                  onClick={() => window.location.href = '/auth'}
                >
                  Get Started
                  <Upload className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign In
                </Button>
              </div>
            </div>

            {/* Right Column - Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Easy Upload</CardTitle>
                  <CardDescription>
                    Simply upload your portfolio spreadsheets and let Scout handle the rest.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Advanced Analytics</CardTitle>
                  <CardDescription>
                    Get institutional-level analysis with risk metrics and performance tracking.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Smart Recaps</CardTitle>
                  <CardDescription>
                    Receive personalized email summaries with the insights that matter most.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success-light/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-success" />
                  </div>
                  <CardTitle className="text-lg">Bank-Grade Security</CardTitle>
                  <CardDescription>
                    Your financial data is protected with enterprise-level encryption.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 bg-primary/5 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-accent to-accent-light rounded flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Scout</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Scout. Institutional-level stock coverage for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;