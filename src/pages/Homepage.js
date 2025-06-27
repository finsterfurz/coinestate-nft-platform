import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { typography } from '../utils/typography';
import { 
  Globe, 
  Building, 
  ArrowRight, 
  Check, 
  Shield, 
  Key, 
  Users, 
  ChevronDown,
  BarChart3,
  TrendingUp,
  Award,
  Star,
  Clock,
  DollarSign
} from '../components/icons';

// ==================== ENHANCED HOMEPAGE ====================
const Homepage = () => {
  const { updateState, theme } = useApp();
  const [openFaq, setOpenFaq] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    totalValue: 0,
    properties: 0,
    holders: 0,
    yield: 0
  });

  // ==================== TESTIMONIALS DATA ====================
  const testimonials = [
    {
      name: "Marcus Weber",
      role: "Portfolio Manager", 
      location: "Zurich, Switzerland",
      content: "CoinEstate's governance model finally gives me transparent control over real estate investments. The KYC verification ensures a professional community, and the Cayman structure provides regulatory confidence."
    },
    {
      name: "Sophie Laurent",
      role: "Investment Advisor",
      location: "Paris, France", 
      content: "Having direct voting rights on property decisions is revolutionary. The dashboard transparency and monthly distributions are exactly what institutional clients demand for real estate exposure."
    },
    {
      name: "Andreas Müller",
      role: "Real Estate Investor",
      location: "Munich, Germany",
      content: "The NFT access model is brilliant - I can transfer my governance rights while maintaining compliance. The Berlin Business Center project shows 8.9% yield with complete operational transparency."
    },
    {
      name: "Emma Thompson",
      role: "Family Office Manager", 
      location: "London, UK",
      content: "Cayman Islands regulation gives our family office the compliance framework we need. The community voting system ensures every decision is democratically made with verified participants."
    },
    {
      name: "David Chen",
      role: "Tech Entrepreneur",
      location: "Amsterdam, Netherlands", 
      content: "As someone who understands blockchain, CoinEstate strikes the perfect balance - Web3 innovation with traditional regulatory compliance. The Vienna project consistently delivers."
    }
  ];

// Animated counter effect
  useEffect(() => {
    const targets = {
      totalValue: 127500000,
      properties: 23,
      holders: 1847,
      yield: 8.4
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats({
        totalValue: Math.floor(targets.totalValue * progress),
        properties: Math.floor(targets.properties * progress),
        holders: Math.floor(targets.holders * progress),
        yield: parseFloat((targets.yield * progress).toFixed(1))
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };
   const stats = [
    {
      label: "Total Property Value",
      value: `€${(animatedStats.totalValue / 1000000).toFixed(1)}M`,
      icon: Building,
      color: "text-blue-600"
    },
    {
      label: "Active Properties",
      value: animatedStats.properties,
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      label: "NFT Holders",
      value: animatedStats.holders.toLocaleString(),
      icon: Users,
      color: "text-purple-600"
    },
    {
      label: "Avg. Annual Yield",
      value: `${animatedStats.yield}%`,
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const propertyPreviews = [
    {
      id: 1,
      name: "Vienna Luxury Complex",
      location: "Vienna, Austria",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      value: "€45M",
      nfts: "2,500 NFTs",
      yield: "7.8%",
      status: "Active",
      highlights: ["Prime Location", "High Occupancy", "Modern Amenities"]
    },
    {
      id: 2,
      name: "Berlin Business Center",
      location: "Berlin, Germany",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      value: "€32M",
      nfts: "1,800 NFTs",
      yield: "8.9%",
      status: "Launching Soon",
      highlights: ["Tech Hub", "Growing Market", "Sustainable Design"]
    },
    {
      id: 3,
      name: "Munich Residential",
      location: "Munich, Germany", 
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      value: "€28M",
      nfts: "1,500 NFTs",
      yield: "7.2%",
      status: "Planning",
      highlights: ["Family Friendly", "Excellent Schools", "Transport Links"]
    }
  ];

  const faqs = [
    {
      question: "What exactly do CoinEstate NFTs represent?",
      answer: "CoinEstate NFTs are digital governance credentials that grant you exclusive voting rights and dashboard access to specific real estate projects. They represent community participation rights - not equity shares, securities, or investment contracts. Each NFT is linked to your verified identity through our KYC process."
    },
    {
      question: "How does the KYC verification process work?",
      answer: "After acquiring an NFT, you complete our secure KYC verification to link your wallet to verified credentials. This unlocks governance dashboard access and eligibility for community participation under our Cayman Islands regulatory framework. The process typically takes 24-48 hours and is required for all governance features."
    },
    {
      question: "Can I transfer my governance NFT to someone else?",
      answer: "Yes, NFTs are fully transferable on secondary markets. However, governance access requires re-verification: the current holder must deregister via our platform, then the new holder must complete their own KYC process to activate dashboard access and voting rights."
    },
    {
      question: "What is the legal structure and regulatory framework?",
      answer: "CoinEstate operates under a Cayman Islands Private Fund + Foundation structure, regulated by CIMA. The CoinEstate Foundation administers community governance and participation rights off-chain, separate from NFT smart contracts. This ensures regulatory compliance while maintaining transparency."
    },
    {
      question: "How are governance decisions and participation handled?",
      answer: "Community members vote on property management decisions, maintenance approvals, and strategic initiatives. Participation in any distributions is voluntary and administered off-chain under Cayman law. Only wallets with verified KYC and valid NFT credentials are eligible for governance participation."
    },
    {
      question: "What are the risks and important disclaimers?",
      answer: "NFTs are governance tools only - not investments. Property markets fluctuate, and community decisions may not always be profitable. Past performance doesn't guarantee future results. Consult legal and financial advisors before participating. Not available in restricted jurisdictions."
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Enhanced Hero Section */}
      <section className={`relative pt-24 pb-20 overflow-hidden ${ 
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {/* Regulatory Badge */}
              <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm border ${ 
                theme === 'dark' 
                  ? 'bg-blue-900/30 border-blue-700/50 text-blue-300' 
                  : 'bg-blue-100/80 border-blue-200/50 text-blue-700'
              }`}>
                <Shield className="h-5 w-5" />
                <span>CIMA Regulated • Cayman Islands</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className={`${typography.h1(theme)} leading-tight`}>
                  Unlock Premium
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Real Estate Governance
                  </span>
                  Through NFT Credentials
                </h1>
                
                <p className={`${typography.bodyLarge(theme)} leading-relaxed max-w-xl`}>
                  Join an exclusive community of verified investors with direct voting rights 
                  on premium European real estate. Each NFT grants governance access, 
                  operational control, and transparent participation in property decisions.
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium">KYC Verified Community</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Regulatory Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Transferable Rights</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => updateState({ currentPage: 'projects' })}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <Building className="h-6 w-6" />
                  <span>Explore Properties</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => updateState({ currentPage: 'dashboard' })}
                  className={`border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-medium transition-all hover:shadow-lg flex items-center justify-center space-x-3 ${
                    theme === 'dark' 
                      ? 'hover:bg-blue-600 hover:text-white backdrop-blur-sm' 
                      : 'hover:bg-blue-50 backdrop-blur-sm'
                  }`}
                >
                  <Key className="h-5 w-5" />
                  <span>Get Access Now</span>
                </button>
              </div>

              {/* Live Stats Preview */}
              <div className="pt-4">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className={`p-4 rounded-lg backdrop-blur-sm border ${
                    theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
                  }`}>
                    <div className="text-2xl font-bold text-blue-600">€127.5M</div>
                    <div className="text-xs text-gray-500">Total Assets</div>
                  </div>
                  <div className={`p-4 rounded-lg backdrop-blur-sm border ${
                    theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
                  }`}>
                    <div className="text-2xl font-bold text-green-600">1,847</div>
                    <div className="text-xs text-gray-500">Active Members</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Dashboard Preview */}
            <div className="relative">
              <div className={`rounded-3xl shadow-2xl p-8 backdrop-blur-sm border-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800/80 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Governance Dashboard
                    </span>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    Active Access
                  </span>
                </div>
                
                {/* Property Card */}
                <div className={`rounded-xl p-6 mb-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Vienna Luxury #247
                      </h4>
                      <p className="text-sm text-gray-500">Prime District, Austria</p>
                    </div>
                    <Key className="h-6 w-6 text-blue-500" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">NFT ID</span>
                      <span className="font-mono text-sm">#0247/2500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Distribution</span>
                      <span className="font-semibold text-green-600">€487.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Voting Power</span>
                      <span className="font-semibold">1 Vote (0.04%)</span>
                    </div>
                  </div>
                </div>
                
                {/* Access Features */}
                <div className="space-y-3">
                  <h5 className="font-medium">Unlocked Features</h5>
                  {[
                    'Property Performance Analytics',
                    'Governance Voting Rights', 
                    'Community Decision Access',
                    'Monthly Distribution Tracking'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg animate-bounce">
                <Shield className="h-8 w-8" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className={`${typography.h3(theme)} mb-4`}>
              Platform Performance
            </h3>
            <p className={`${typography.body(theme)} max-w-2xl mx-auto`}>
              Real-time metrics from our community-governed real estate portfolio
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`p-6 rounded-xl backdrop-blur-sm border transition-all hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Property Previews */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2(theme)} mb-6`}>
              Featured Properties
            </h2>
            <p className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto`}>
              Explore our curated portfolio of premium European real estate opportunities. 
              Each property offers governance participation through NFT credentials.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {propertyPreviews.map((property) => (
              <div key={property.id} className={`group rounded-2xl overflow-hidden shadow-lg border transition-all hover:scale-105 hover:shadow-2xl cursor-pointer ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
              onClick={() => updateState({ currentPage: 'projects' })}>
                <div className="relative overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === 'Active' ? 'bg-green-100 text-green-800' :
                      property.status === 'Launching Soon' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {property.name}
                  </h3>
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {property.location}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="block text-gray-500">Property Value</span>
                      <span className="font-semibold">{property.value}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Expected Yield</span>
                      <span className="font-semibold text-green-600">{property.yield}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="block text-gray-500 text-sm mb-2">Available</span>
                    <span className="font-semibold">{property.nfts}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {property.highlights.map((highlight, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => updateState({ currentPage: 'projects' })}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <span>View All Properties</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2(theme)} mb-6`}>
              Trusted by Verified Investors
            </h2>
            <p className={`${typography.body(theme)} max-w-2xl mx-auto`}>
              Join a community of verified professionals participating in transparent real estate governance
            </p>
          </div>
          
          <div className="relative">
            <div className={`rounded-2xl p-8 border text-center max-w-4xl mx-auto ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              
              <blockquote className={`text-xl italic mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonials[currentTestimonial].name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Journey Section */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2(theme)} mb-6`}>
              Your Governance Journey
            </h2>
            <p className={`${typography.body(theme)} max-w-2xl mx-auto`}>
              Four simple steps to join verified real estate governance community
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: "Explore Portfolio",
                  description: "Browse premium European real estate opportunities with transparent metrics",
                  icon: Building,
                  status: "available",
                  action: "Start Exploring"
                },
                {
                  step: 2, 
                  title: "Acquire NFT",
                  description: "Purchase governance credentials for your chosen properties",
                  icon: Key,
                  status: "pending",
                  action: "Get NFT Access"
                },
                {
                  step: 3,
                  title: "Complete KYC",
                  description: "Verify identity for regulatory compliance and community access",
                  icon: Shield,
                  status: "locked",
                  action: "Verify Identity"
                },
                {
                  step: 4,
                  title: "Participate",
                  description: "Vote on decisions and monitor property performance",
                  icon: Users,
                  status: "locked", 
                  action: "Start Voting"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                const isActive = item.status === "available";
                const isCompleted = item.status === "completed";
                const isPending = item.status === "pending";
                
                return (
                  <div key={index} className="text-center">
                    <div className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-600 text-white shadow-lg'
                        : isActive 
                          ? 'bg-blue-600 text-white shadow-xl scale-110'
                          : isPending
                            ? theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                      
                      <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center ${
                        isActive 
                          ? 'bg-blue-700 text-white'
                          : isCompleted
                            ? 'bg-green-700 text-white'
                            : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {item.step}
                      </div>
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-3 ${
                      isActive || isCompleted 
                        ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm mb-6 ${
                      isActive || isCompleted 
                        ? theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                    
                    <button 
                      onClick={() => {
                        if (item.step === 1) updateState({ currentPage: 'projects' });
                        if (item.step === 2) updateState({ currentPage: 'dashboard' });
                      }}
                      disabled={!isActive && !isCompleted}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                          : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? 'Completed' : item.action}
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <div className={`mt-12 h-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: '25%' }}
              />
            </div>
            
            <div className="text-center mt-6">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Progress: 1 of 4 steps completed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2(theme)} mb-6`}>
              Frequently Asked Questions
            </h2>
            <p className={`${typography.body(theme)} max-w-2xl mx-auto`}>
              Everything you need to know about CoinEstate NFT governance credentials and regulatory framework
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } ${openFaq === index ? 'shadow-xl ring-2 ring-blue-500/20' : 'shadow-lg hover:shadow-xl'}`}>
                <button
                  className={`w-full px-8 py-6 text-left flex justify-between items-start transition-all duration-200 ${
                    theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  } ${openFaq === index ? (theme === 'dark' ? 'bg-gray-700/30' : 'bg-blue-50/50') : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className={`text-lg font-semibold pr-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-6 h-6 transition-transform duration-300 flex-shrink-0 ${
                    openFaq === index ? 'rotate-180 text-blue-600' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-8 pb-6">
                    <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              Still have questions? Our compliance team is here to help.
            </p>
            <button className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the Future of Real Estate?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Become part of an exclusive, KYC-verified community with direct governance rights 
            over premium European properties. Transparent. Regulated. Profitable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button 
              onClick={() => updateState({ currentPage: 'dashboard' })}
              className="group bg-white text-blue-600 px-10 py-5 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <Key className="h-6 w-6" />
              <span>Get Your NFT Access</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white text-white px-10 py-5 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
              Schedule Consultation
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>CIMA Regulated</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>1,800+ Verified Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>€127M+ Assets Under Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Cayman Foundation Structure</span>
            </div>
          </div>
          
          <div className="mt-8 text-blue-200 text-sm max-w-4xl mx-auto">
            <strong>Important:</strong> CoinEstate NFTs represent governance participation rights only, not securities or investment contracts. 
            Community voting and any distributions are administered off-chain under Cayman Islands law. 
            Consult legal and financial advisors before participating. Not available in restricted jurisdictions.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;