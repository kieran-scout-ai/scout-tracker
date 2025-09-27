import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart3, Mail, Shield, TrendingUp, Users } from "lucide-react";
import heroImage from "@/assets/hero-financial.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card-secondary to-background">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Scout</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Features
            </Button>
            <Button variant="ghost" className="hidden md:inline-flex">
              Pricing
            </Button>
            <Button variant="outline">
              Sign In
            </Button>
            <Button variant="hero">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Institutional-level
                  <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent"> stock coverage</span>
                  <span className="block">for everyone</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Transform your spreadsheets into professional portfolio analysis with AI-powered insights and automated email recaps.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                  Upload Portfolio
                  <Upload className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  View Demo
                  <TrendingUp className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10,000+</div>
                  <div className="text-sm text-muted-foreground">Portfolios Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent-light/20 blur-3xl rounded-full"></div>
              <img 
                src={heroImage} 
                alt="Financial data visualization dashboard"
                className="relative z-10 w-full h-auto rounded-2xl shadow-hero border border-border/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Professional Portfolio Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload your spreadsheets, get institutional-grade analysis, and receive automated insights via email.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Easy Upload</CardTitle>
                <CardDescription>
                  Simply upload your portfolio spreadsheets and let Scout handle the rest.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Get institutional-level analysis with risk metrics, performance tracking, and trend analysis.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Smart Recaps</CardTitle>
                <CardDescription>
                  Receive personalized email summaries with the insights that matter most to you.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success-light/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Bank-Grade Security</CardTitle>
                <CardDescription>
                  Your financial data is protected with enterprise-level encryption and security protocols.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Multiple Portfolios</CardTitle>
                <CardDescription>
                  Manage and track multiple portfolios with custom analysis preferences for each.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border shadow-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Stay informed with real-time market data and portfolio performance updates.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            Ready to elevate your portfolio analysis?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of investors who trust Scout for professional-grade portfolio insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Start Your Free Trial
              <Upload className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold">Scout</h3>
          </div>
          <p className="text-primary-foreground/80">
            © 2024 Scout. Institutional-level stock coverage for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;