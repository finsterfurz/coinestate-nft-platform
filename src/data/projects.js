// src/data/projects.js

export const ALL_PROJECTS = [
  {
    slug: 'vienna-luxury-apartments',
    name: 'Vienna Luxury Apartments',
    location: 'Vienna, Austria - Innere Stadt (1st District)',
    totalValue: 12500000,
    nftCount: 2500,
    monthlyRent: 41250,
    status: 'Fully Allocated',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
    description: 'Premium residential complex in Vienna\'s UNESCO heritage district featuring historic architecture with modern luxury amenities.',
    highlights: ['UNESCO Heritage Location', 'Historic Architecture', 'Premium Finishes', '3.5% Success Rate'],
    marketData: {
      pricePerSqm: 24977,
      rentPerSqm: 25,
      vacancyRate: 0.5,
      successRate: 3.5,
      propertySize: 500
    },
    privateInfo: {
      rentalBreakdown: {
        grossRent: 41250,
        maintenance: 3200,
        management: 2050,
        insurance: 890,
        netIncome: 35110
      },
      caymanFundPerformance: {
        totalPool: 87775,
        monthlyDistribution: 35.11,
        occupancyRate: 97.3
      }
    }
  },
  {
    slug: 'berlin-tech-hub',
    name: 'Berlin Tech Hub',
    location: 'Berlin, Germany - Mitte District',
    totalValue: 3500000,
    nftCount: 1800,
    monthlyRent: 15625,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&h=400&fit=crop',
    description: 'Modern office complex in Berlin\'s startup district with cutting-edge facilities and tech company tenants.',
    highlights: ['Tech Hub Location', 'Modern Infrastructure', 'Co-working Spaces', '4.8% Success Rate'],
    marketData: {
      pricePerSqm: 7000,
      rentPerSqm: 31.25,
      vacancyRate: 2.2,
      successRate: 4.8,
      propertySize: 500
    },
    privateInfo: {
      rentalBreakdown: {
        grossRent: 15625,
        maintenance: 1200,
        management: 780,
        insurance: 345,
        netIncome: 13300
      },
      caymanFundPerformance: {
        totalPool: 21945,
        monthlyDistribution: 13.30,
        occupancyRate: 94.8
      }
    }
  },
  {
    slug: 'zurich-commercial-center',
    name: 'Zurich Commercial Center',
    location: 'Zurich, Switzerland - Financial District',
    totalValue: 5250000,
    nftCount: 3000,
    monthlyRent: 15750,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
    description: 'Prime commercial real estate in Zurich\'s financial center with institutional banking tenants.',
    highlights: ['Financial District', 'Banking Tenants', 'Swiss Quality', '3.0% Success Rate'],
    marketData: {
      pricePerSqm: 10500,
      rentPerSqm: 31.5,
      vacancyRate: 2.6,
      successRate: 3.0,
      propertySize: 500
    }
  },
  {
    slug: 'munich-corporate-plaza',
    name: 'Munich Corporate Plaza',
    location: 'Munich, Germany - Maxvorstadt',
    totalValue: 4200000,
    nftCount: 2100,
    monthlyRent: 18750,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    description: 'State-of-the-art office complex in Munich\'s business district with Fortune 500 tenants.',
    highlights: ['Corporate Tenants', 'Premium Location', 'Modern Infrastructure', '4.5% Success Rate'],
    marketData: {
      pricePerSqm: 8400,
      rentPerSqm: 37.5,
      vacancyRate: 3.1,
      successRate: 4.5,
      propertySize: 500
    }
  },
  {
    slug: 'amsterdam-canal-residences',
    name: 'Amsterdam Canal Residences',
    location: 'Amsterdam, Netherlands - Grachtengordel',
    totalValue: 6800000,
    nftCount: 3400,
    monthlyRent: 27200,
    status: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1459679749680-18eb2d0bede5?w=600&h=400&fit=crop',
    description: 'Historic canal-side luxury apartments in Amsterdam\'s UNESCO World Heritage canal ring.',
    highlights: ['UNESCO Heritage', 'Canal Views', 'Historic Architecture', '4.8% Success Rate'],
    marketData: {
      pricePerSqm: 13600,
      rentPerSqm: 54.4,
      vacancyRate: 1.2,
      successRate: 4.8,
      propertySize: 500
    }
  },
  {
    slug: 'frankfurt-skyline-towers',
    name: 'Frankfurt Skyline Towers',
    location: 'Frankfurt, Germany - Bankenviertel',
    totalValue: 5500000,
    nftCount: 2750,
    monthlyRent: 22917,
    status: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1541913299-ed5fe5c5e3d3?w=600&h=400&fit=crop',
    description: 'Premium office space in Frankfurt\'s banking quarter with ECB proximity and institutional tenants.',
    highlights: ['Banking Quarter', 'ECB Proximity', 'Institutional Grade', '5.0% Success Rate'],
    marketData: {
      pricePerSqm: 11000,
      rentPerSqm: 45.8,
      vacancyRate: 4.2,
      successRate: 5.0,
      propertySize: 500
    }
  },
  {
    slug: 'paris-business-district',
    name: 'Paris Business District',
    location: 'Paris, France - La Défense',
    totalValue: 7200000,
    nftCount: 3600,
    monthlyRent: 25200,
    status: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600&h=400&fit=crop',
    description: 'Modern office complex in Europe\'s largest business district with multinational corporate tenants.',
    highlights: ['Largest Business District', 'Multinational Tenants', 'Metro Connected', '4.2% Success Rate'],
    marketData: {
      pricePerSqm: 14400,
      rentPerSqm: 50.4,
      vacancyRate: 6.8,
      successRate: 4.2,
      propertySize: 500
    }
  },
  {
    slug: 'london-canary-wharf',
    name: 'London Canary Wharf',
    location: 'London, UK - Canary Wharf',
    totalValue: 8900000,
    nftCount: 4450,
    monthlyRent: 31200,
    status: 'Planning',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop',
    description: 'Premium office space in London\'s financial district with major banking and finance tenants.',
    highlights: ['Financial Center', 'Banking Tenants', 'Prime Location', '4.2% Success Rate'],
    marketData: {
      pricePerSqm: 17800,
      rentPerSqm: 62.4,
      vacancyRate: 5.1,
      successRate: 4.2,
      propertySize: 500
    }
  }
];

export const DASHBOARD_PROJECTS = ALL_PROJECTS.filter(p => p.privateInfo);