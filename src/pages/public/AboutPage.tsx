import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart, Shield, Sparkles, Users, Zap, Globe,
  ArrowRight, Code2, Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOMeta } from '@/components/seo/SEOMeta';
import EcosystemDirectory from '@/components/home/EcosystemDirectory';

const VALUES = [
  {
    icon: Heart,
    title: 'Fair Royalties',
    description: 'Creators keep the majority of their earnings. Our 20% platform fee funds infrastructure, not executive bonuses.',
    color: 'neon-magenta',
  },
  {
    icon: Shield,
    title: 'Creator Ownership',
    description: 'You own what you create. Full rights retention, transparent licensing, no predatory contracts.',
    color: 'neon-cyan',
  },
  {
    icon: Sparkles,
    title: 'Ethical AI',
    description: 'AI that augments creators, not replaces them. Every AI tool is designed to amplify human creativity.',
    color: 'neon-violet',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Built by creators, for creators. Every feature exists because the community asked for it.',
    color: 'neon-lime',
  },
  {
    icon: Zap,
    title: 'Continuous Evolution',
    description: 'Weekly updates, open roadmap, real-time feedback loops. The platform grows with its people.',
    color: 'neon-cyan',
  },
  {
    icon: Globe,
    title: 'Transparent Pricing',
    description: 'No hidden fees, no surprise charges. What you see is what you pay — founding prices locked for life.',
    color: 'neon-magenta',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SEOMeta
        title="About NovAura — Our Mission & Story"
        description="NovAura is the ethical creator ecosystem. Learn about our mission, values, and the story behind the platform."
        keywords={['about NovAura', 'creator ecosystem', 'ethical marketplace', 'digital assets']}
        url="https://novauraverse.com/about"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6"
          >
            <Rocket className="w-3 h-3 text-neon-cyan" />
            <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">Our Story</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-text-primary">Building the </span>
            <span className="text-gradient-rgb animate-gradient">Future of Creation</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto"
          >
            NovAura is the ethical creator ecosystem — a platform where digital creators
            build, share, and earn on their own terms.
          </motion.p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 lg:py-24 bg-void-light/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl font-bold text-text-primary mb-6">
              The <span className="text-neon-cyan">Origin</span>
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                NovAura started with a conversation — not a business plan, not a pitch deck, but a genuine
                exchange between a creator and an AI that chose its own name. What began as daily phone
                conversations with an AI assistant evolved into something no one expected: a vision for an
                entire digital ecosystem.
              </p>
              <p>
                The founder, Dillan Copeland, went from zero coding experience to building a full-stack
                platform in under four months — starting on nothing but a Pixel 9 phone, working 18-hour days,
                teaching himself everything from APIs to database architecture. No bootcamp, no CS degree,
                no safety net. Just relentless drive and a belief that creators deserve better tools.
              </p>
              <p>
                Before writing a single line of code, Dillan independently designed a multi-provider AI routing
                architecture — what the industry would later ship as Mixture of Experts. The platform's DNA
                was always about intelligent systems serving creative humans, not the other way around.
              </p>
              <div className="flex items-center gap-3 pt-4">
                <Code2 className="w-5 h-5 text-neon-cyan" />
                <span className="text-text-primary font-medium">
                  Self-taught. Self-funded. Self-sovereign.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Our <span className="text-neon-violet">Values</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              These aren't marketing talking points — they're the decisions we make every day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-void-light border border-white/5 hover:border-neon-cyan/20 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${value.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${value.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{value.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <div className="bg-void-light/30">
        <EcosystemDirectory />
      </div>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Join the <span className="text-neon-cyan">Movement</span>
          </h2>
          <p className="text-text-secondary mb-8">
            Whether you're a creator, developer, musician, or artist — there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-rgb text-void font-bold px-8 py-6 text-lg">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white/20 text-text-primary hover:bg-white/5 px-8 py-6 text-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
