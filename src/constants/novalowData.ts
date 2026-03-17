import { 
  Globe, Shield, Zap, 
  Brain, Bot, Sparkles, 
  Cpu, Code, Workflow, Layout, Terminal, BookOpen, Monitor, Server, Megaphone, Home, Key, Cloud, Lock
} from 'lucide-react';

export const mockDomains = [
  { name: '.com', price: 10.99, available: true },
  { name: '.xyz', price: 1.99, available: true },
  { name: '.io', price: 29.99, available: true },
  { name: '.dev', price: 15.99, available: true },
  { name: '.app', price: 18.99, available: true },
  { name: '.net', price: 12.99, available: true },
  { name: '.org', price: 11.99, available: true },
  { name: '.co', price: 25.99, available: true },
  { name: '.online', price: 4.99, available: true },
  { name: '.site', price: 4.99, available: true },
  { name: '.store', price: 4.99, available: true },
  { name: '.tech', price: 7.99, available: true },
  { name: '.info', price: 3.99, available: true },
];

export const templates = [
  { id: 1, name: 'Portfolio', category: 'Personal', description: 'Showcase your work with style', url: '/templates/portfolio.html' },
  { id: 2, name: 'Startup', category: 'Business', description: 'Launch your product', url: '/templates/startup.html' },
  { id: 3, name: 'Blog', category: 'Content', description: 'Share your thoughts', url: '/templates/blog.html' },
  { id: 4, name: 'E-commerce', category: 'Store', description: 'Sell your products', url: '#' },
  { id: 5, name: 'SaaS', category: 'Business', description: 'Showcase your app', url: '#' },
  { id: 6, name: 'Resume', category: 'Personal', description: 'Professional CV online', url: '#' },
];

export const aiTools = [
  {
    name: 'Kimi',
    icon: Sparkles,
    strengths: ['Card & Asset Art', 'Website Building', 'Visual Design'],
    bestFor: 'UI/UX, Graphics, Web Design',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Claude',
    icon: Brain,
    strengths: ['Robust Coding', 'Complex Logic', 'Architecture'],
    bestFor: 'Backend, APIs, System Design',
    color: 'from-orange-500 to-amber-500'
  },
  {
    name: 'Gemini',
    icon: Bot,
    strengths: ['General Advisor', 'Error Correction', 'Chat'],
    bestFor: 'Debugging, Research, Planning',
    color: 'from-blue-500 to-cyan-500'
  },
];

export const tutorials = [
  {
    title: 'Set Up Your Home LLM',
    description: 'Run AI locally with Ollama, LM Studio, or LocalAI',
    icon: Cpu,
    level: 'Beginner'
  },
  {
    title: 'Modern Models 2026',
    description: 'Claude 4, GPT-5, Gemini Ultra, Llama 4 comparisons',
    icon: Brain,
    level: 'Intermediate'
  },
  {
    title: 'Coding Language Guide',
    description: 'Python, TypeScript, Rust, Go - which for what?',
    icon: Code,
    level: 'All Levels'
  },
  {
    title: 'AI Workflow Pipelines',
    description: 'From prototype to production with AI assistance',
    icon: Workflow,
    level: 'Advanced'
  },
];

export const navTabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'domains', label: 'Domains', icon: Globe },
  { id: 'builder', label: 'Site Builder', icon: Layout },
  { id: 'devtools', label: 'Dev Tools', icon: Terminal },
  { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
  { id: 'ide', label: 'Aura IDE', icon: Monitor },
  { id: 'hosting', label: 'Hosting', icon: Server },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'promote', label: 'Promote', icon: Megaphone },
];

export const tlds = [
  { name: '.xyz', price: '$1.99', popular: true },
  { name: '.online', price: '$4.99', popular: true },
  { name: '.site', price: '$4.99', popular: false },
  { name: '.store', price: '$4.99', popular: false },
  { name: '.com', price: '$10.99', popular: false },
  { name: '.io', price: '$29.99', popular: false },
];

export const bannerFeatures = [
  { icon: Shield, title: 'Free SSL & HTTPS', desc: 'Automatic security certificates' },
  { icon: Globe, title: 'Global Edge CDN', desc: 'Lightning-fast worldwide delivery' },
  { icon: Zap, title: 'One-Click Deploy', desc: 'Launch in seconds, not hours' },
];

export const securityFeatures = [
  { icon: Shield, title: 'DDoS Protection', desc: 'Mitigate attacks automatically' },
  { icon: Lock, title: 'Malware Scanning', desc: 'Continuous threat detection' },
  { icon: Server, title: 'Auto Backups', desc: 'Daily snapshots included' },
];

export const cloudScalingSteps = [
  { 
    icon: Key, 
    title: 'Free SSL Certificates', 
    desc: 'We use Let\'s Encrypt to automatically provision and renew SSL certificates for every domain. Zero config, zero cost, bank-grade encryption.',
    provider: 'Powered by Let\'s Encrypt'
  },
  { 
    icon: Cloud, 
    title: 'DDoS Protection', 
    desc: 'Cloudflare\'s free tier sits in front of your site, absorbing and distributing attack traffic before it reaches your server. Handles 99% of attacks.',
    provider: 'Powered by Cloudflare'
  },
  { 
    icon: Cpu, 
    title: 'Global Edge Network', 
    desc: 'Your content is cached at 300+ locations worldwide. Visitors connect to the nearest edge server for sub-50ms response times.',
    provider: 'Powered by Cloudflare CDN'
  },
];

export const faqs = [
  { q: "What's included in the Creator Plan?", a: "The Creator Plan at $8.99/month includes 1 domain registration (using the cheapest available TLD), access to our dev and creator platform, and entry-level access to the Novaura Verse ecosystem with credits and features." },
  { q: "How do renewals work?", a: "We keep renewals honest—no surprise hikes after the intro price. What you see is what you pay, year after year." },
  { q: "Can I transfer an existing domain?", a: "Absolutely! We offer free migration assistance. We'll handle the DNS, email, and verification to ensure everything works perfectly." },
  { q: "How is SSL free? Is it secure?", a: "We use Let's Encrypt, the industry-standard free certificate authority trusted by millions of sites. It's the same encryption banks use—just without the price tag." },
  { q: "Do you offer web hosting?", a: "Yes! Our hosting scales with your needs—from static sites to full-stack apps with SSL, CDN, and caching included." },
];
