import React, { useState } from 'react';
import {
  Search, Zap, Calculator,
  CheckCircle, XCircle, Loader2,
  Lock, MessageSquare, Star,
  Package, Crown, Check
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { mockDomains, tlds, faqs, cloudScalingSteps } from '../../constants/novalowData';

// Domain Bundle Types
interface DomainBundle {
  id: string;
  name: string;
  icon: React.ElementType;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const domainBundles: DomainBundle[] = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    icon: Package,
    price: 8.99,
    yearlyPrice: 89.99,
    description: 'Perfect for personal projects and startups',
    color: 'from-cyan-500 to-blue-500',
    features: [
      '1 Domain (.xyz or .online)',
      'Aura Builder Access',
      'Free SSL Certificate',
      'Basic DDoS Protection',
      'Email Forwarding',
      '24/7 Support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Bundle',
    icon: Star,
    price: 19.99,
    yearlyPrice: 199.99,
    description: 'Best for growing businesses',
    color: 'from-violet-500 to-purple-500',
    popular: true,
    features: [
      '3 Domains (any TLD)',
      'Priority Aura Builder Access',
      'Free SSL Certificates',
      'Advanced DDoS Protection',
      'Cloudflare CDN',
      'Priority Support',
      'WHOIS Privacy',
      'Domain Lock'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Bundle',
    icon: Crown,
    price: 49.99,
    yearlyPrice: 499.99,
    description: 'For enterprises and power users',
    color: 'from-amber-500 to-orange-500',
    features: [
      '10 Domains (any TLD)',
      'Unlimited Aura Builder Access',
      'Premium SSL Certificates',
      'Enterprise DDoS Protection',
      'Global Edge CDN',
      'Dedicated Support',
      'WHOIS Privacy',
      'Domain Lock',
      'Advanced Analytics',
      'API Access'
    ]
  }
];

const DomainMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof mockDomains>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [domainCount, setDomainCount] = useState(1);
  const [includeBuilder, setIncludeBuilder] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const handleDomainSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = mockDomains.map(tld => ({
      ...tld,
      available: Math.random() > 0.3,
      price: tld.price + (Math.random() > 0.5 ? 0 : Math.random() * 5)
    }));
    
    setSearchResults(results.sort((a, b) => a.price - b.price));
    setIsSearching(false);
  };

  const calculatePrice = () => {
    const domainPrice = 1.99 * domainCount;
    const builderPrice = includeBuilder ? 3.99 : 0;
    let total = domainPrice + builderPrice;
    if (billingCycle === 'yearly') total = total * 10;
    
    return {
      display: billingCycle === 'monthly' ? total : total / 10,
      total: total
    };
  };

  const price = calculatePrice();

  return (
    <div className="space-y-12 pb-20">
      {/* Hero & Search */}
      <section className="text-center space-y-6 pt-12">
        <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan px-4 py-1 uppercase tracking-widest text-[10px] bg-neon-cyan/5">
          Nova Genesis Network
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight">
          Find your name.<br />
          <span className="bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta bg-clip-text text-transparent">Claim your space.</span>
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
          Search 500+ extensions—from .xyz to .com—at the lowest renewal rates in the galaxy. 
          Powered by NovAura's direct baremetal registrar integration.
        </p>

        <div className="max-w-2xl mx-auto relative group">
          <form onSubmit={handleDomainSearch} className="flex items-center gap-2 p-2 rounded-full bg-void-lighter border border-white/10 focus-within:border-neon-cyan/50 focus-within:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all duration-300">
            <Search className="w-5 h-5 ml-4 text-text-muted group-focus-within:text-neon-cyan" />
            <Input 
              type="text"
              placeholder="Search domains (e.g., aura-world)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-text-muted"
            />
            <Button 
              type="submit"
              disabled={isSearching}
              className="bg-neon-cyan hover:bg-neon-cyan/90 text-void font-bold rounded-full px-8 transition-all hover:scale-105"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </Button>
          </form>

          {/* Licensing Overlay on Results */}
          {hasSearched && (
            <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-void-light relative">
              {/* Coming Soon Glass Overlay */}
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-void/60 flex flex-col items-center justify-center p-8 text-center border border-neon-cyan/20 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-4 border border-neon-cyan/30">
                  <Lock className="w-8 h-8 text-neon-cyan" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-2">Pending License</h3>
                <p className="text-text-secondary max-w-md mb-6">
                  We are currently finalizing our Baremetal Registrar License to ensure 100% direct pricing for our users. 
                  Registrations will be unlocked shortly. 
                </p>
                <div className="flex gap-4">
                  <Badge className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">Coming Soon</Badge>
                  <Badge className="bg-neon-violet/20 text-neon-violet border border-neon-violet/30">Waitlist Active</Badge>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto opacity-50 grayscale">
                <div className="p-4 border-b border-white/5">
                  <p className="text-sm text-text-muted">
                    Results for <span className="font-semibold text-neon-cyan">{searchQuery}</span>
                  </p>
                </div>
                {searchResults.map((result) => (
                  <div key={result.name} className="p-4 flex items-center justify-between border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      {result.available ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                      <span className="font-heading font-semibold text-lg">{searchQuery}{result.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-heading font-bold">${result.price.toFixed(2)}</span>
                      <Button size="sm" disabled className="bg-neon-cyan/20 text-neon-cyan">Reserved</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Domain Bundles */}
      <section className="pt-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="border-neon-violet/50 text-neon-violet px-4 py-1 uppercase tracking-widest text-[10px] bg-neon-violet/5 mb-4">
            Bundle & Save
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Choose Your <span className="text-gradient">Perfect Bundle</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Everything you need to launch your online presence. Domains, builder access, and security—all in one package.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {domainBundles.map((bundle) => {
            const Icon = bundle.icon;
            const isSelected = selectedBundle === bundle.id;
            const price = billingCycle === 'monthly' ? bundle.price : bundle.yearlyPrice / 12;
            
            return (
              <Card 
                key={bundle.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isSelected 
                    ? 'border-neon-cyan/50 shadow-[0_0_30px_rgba(0,240,255,0.15)]' 
                    : 'border-white/10 hover:border-white/20'
                } ${bundle.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {bundle.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-neon-cyan to-neon-violet text-void text-xs font-bold px-4 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${bundle.color}`} />
                
                <CardContent className="p-6 space-y-6">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bundle.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">{bundle.name}</h3>
                      <p className="text-text-muted text-sm">{bundle.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-heading text-white">${price.toFixed(2)}</span>
                    <span className="text-text-muted">/mo</span>
                  </div>

                  {/* Billing Toggle Info */}
                  <p className="text-xs text-text-muted">
                    {billingCycle === 'yearly' 
                      ? `Billed annually at $${bundle.yearlyPrice}` 
                      : 'Switch to yearly & save 17%'}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {bundle.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button 
                    className={`w-full font-bold transition-all ${
                      isSelected
                        ? 'bg-neon-cyan text-void hover:bg-neon-cyan/90'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                    onClick={() => setSelectedBundle(bundle.id)}
                  >
                    {isSelected ? (
                      <><CheckCircle className="w-4 h-4 mr-2" /> Selected</>
                    ) : (
                      'Select Bundle'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bundle Comparison Note */}
        <p className="text-center text-text-muted text-sm mt-6">
          All bundles include free migration assistance and 30-day money-back guarantee.
        </p>
      </section>

      {/* Pricing Calculator */}
      <section className="grid lg:grid-cols-2 gap-12 pt-12">
        <div className="space-y-6">
          <Badge className="bg-neon-violet/10 text-neon-violet border-neon-violet/20 uppercase tracking-widest text-[10px]">Ecosystem Costs</Badge>
          <h2 className="text-4xl font-bold font-heading">
            Low first year.<br />
            <span className="text-text-secondary">Low every year.</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Direct-to-registrar pricing means zero markups. We pass the savings onto the creators.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {tlds.map((tld) => (
              <div key={tld.name} className="p-4 rounded-xl bg-void-light border border-white/5 flex items-center justify-between">
                <span className="font-heading font-semibold">{tld.name}</span>
                <span className="text-neon-cyan font-bold">{tld.price}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-void-light border-white/10 shadow-glow-cyan relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Calculator className="w-8 h-8 text-neon-cyan/20" />
          </div>
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-bold font-heading">Cost Estimator</h3>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-void-lighter">
              <span className="text-sm text-text-secondary font-mono">Billing Cycle</span>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${billingCycle === 'monthly' ? 'text-neon-cyan' : 'text-text-muted'}`}>Monthly</span>
                <Switch 
                  checked={billingCycle === 'yearly'}
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                />
                <span className={`text-xs ${billingCycle === 'yearly' ? 'text-neon-cyan' : 'text-text-muted'}`}>Yearly (-17%)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-mono text-text-secondary">Genesis TLDs</span>
                <Badge variant="outline" className="text-neon-cyan border-neon-cyan/30 font-mono">{domainCount}</Badge>
              </div>
              <Slider 
                value={[domainCount]} 
                onValueChange={(v) => setDomainCount(v[0])}
                min={1} max={10} step={1}
                className="py-4"
              />
            </div>

            <div className="p-4 rounded-lg bg-void-lighter space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm">Aura Builder Access</span>
                </div>
                <Switch checked={includeBuilder} onCheckedChange={setIncludeBuilder} />
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-tighter mb-1">Estimated {billingCycle === 'monthly' ? 'Monthly' : 'Annual'}</p>
                <p className="text-4xl font-bold font-heading text-neon-cyan">${price.display.toFixed(2)}</p>
              </div>
              <Button className="bg-neon-cyan text-void font-bold hover:shadow-glow-cyan" disabled>
                Request Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cloud Scaling Meta Info */}
      <section className="grid md:grid-cols-3 gap-6 pt-12">
        {cloudScalingSteps.map((step) => (
          <Card key={step.title} className="bg-void-lighter border-white/5 p-6 hover:border-neon-cyan/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/5 flex items-center justify-center mb-4 border border-neon-cyan/10">
              <step.icon className="w-6 h-6 text-neon-cyan" />
            </div>
            <h4 className="font-heading font-bold mb-2">{step.title}</h4>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">{step.desc}</p>
            <Badge variant="outline" className="text-[10px] opacity-60">{step.provider}</Badge>
          </Card>
        ))}
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto pt-12">
        <div className="text-center mb-10">
          <MessageSquare className="w-10 h-10 text-neon-cyan/30 mx-auto mb-4" />
          <h3 className="text-3xl font-bold font-heading">Protocol FAQ</h3>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
              <AccordionTrigger className="text-left font-heading hover:text-neon-cyan transition-colors py-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-text-secondary leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
};

export default DomainMarketplace;
