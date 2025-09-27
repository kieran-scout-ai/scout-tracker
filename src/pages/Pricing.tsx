import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScoutLogo } from '@/components/ScoutLogo';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Individual',
      price: '$5',
      period: '/month',
      description: 'Perfect for personal portfolio management',
      portfolios: '1 portfolio',
      features: [
        'Upload portfolio holdings',
        'Advanced analytics & insights',
        'AI-powered portfolio recaps',
        'Email summaries',
        'Bank-grade security'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Adviser',
      price: '$5',
      period: '/month per portfolio',
      description: 'Ideal for financial advisers managing multiple clients',
      portfolios: 'Up to 10 portfolios',
      features: [
        'All Individual features',
        'Multi-portfolio management',
        'Client portfolio separation',
        'Bulk portfolio operations',
        'Advanced reporting',
        'Priority support'
      ],
      buttonText: 'Get Started',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Tailored solutions for large organizations',
      portfolios: 'Custom portfolio limits',
      features: [
        'All Adviser features',
        'Unlimited portfolios',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees',
        'Advanced security features',
        'API access'
      ],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-card">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ScoutLogo />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Scout
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-foreground hover:text-primary"
            >
              Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-accent/20 hover:border-accent/50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your portfolio management needs. All plans include our core features with scalable limits.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-accent shadow-lg scale-105 bg-gradient-to-b from-card to-card/50' 
                  : 'border-border hover:border-accent/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-accent to-primary text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <CardHeader className={plan.popular ? 'pt-12' : ''}>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline space-x-1 pt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <div className="text-sm font-medium text-accent pt-2">
                  {plan.portfolios}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-accent to-primary hover:from-accent-light hover:to-primary-light' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => {
                    if (plan.buttonText === 'Contact Sales') {
                      // Handle contact sales - could open a modal or navigate to contact form
                      console.log('Contact sales clicked');
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-16 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 text-left">
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">Yes, you can change your plan at any time. Changes take effect immediately and billing is prorated.</p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">What happens if I exceed my portfolio limit?</h3>
              <p className="text-muted-foreground">You'll be prompted to upgrade to a higher tier or remove portfolios to stay within your limit.</p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">Absolutely. We use bank-grade encryption and security measures to protect your portfolio data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border/50">
        <div className="flex items-center justify-center space-x-3 text-muted-foreground">
          <ScoutLogo />
          <span>© 2024 Scout. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;