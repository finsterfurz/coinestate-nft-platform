import React from 'react';
import PropTypes from 'prop-types';
import { Star, Quote, Shield, TrendingUp } from '../../icons';
import { typography } from '../../../utils/typography';
import animations from '../../../styles/animations.module.css';

const TestimonialsSection = ({ theme }) => {
  const testimonials = [
    {
      id: 1,
      name: "Alexandra Müller",
      role: "Portfolio Manager",
      location: "Zurich, Switzerland",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      text: "CoinEstate has revolutionized my real estate investment approach. The transparency of governance decisions and monthly distributions gives me confidence in every property decision.",
      highlight: "Transparent governance",
      nftCount: "12 NFTs",
      joinDate: "Early Member 2024"
    },
    {
      id: 2,
      name: "Marcus Schmidt",
      role: "Tech Entrepreneur",
      location: "Berlin, Germany",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      text: "The KYC-verified community and direct voting rights make this platform unique. I actually have a say in property management decisions, not just passive returns.",
      highlight: "Direct voting rights",
      nftCount: "8 NFTs",
      joinDate: "Member since Q2 2024"
    },
    {
      id: 3,
      name: "Sophie Laurent",
      role: "Investment Advisor",
      location: "Paris, France",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      text: "The Cayman Islands regulatory framework provides excellent legal protection. Combined with the NFT governance model, it's the future of real estate investment.",
      highlight: "Regulatory protection",
      nftCount: "15 NFTs",
      joinDate: "Founding Member 2024"
    }
  ];

  const stats = [
    { value: "4.9/5", label: "Average Rating", icon: Star },
    { value: "98%", label: "Satisfaction Rate", icon: TrendingUp },
    { value: "1,847", label: "Verified Members", icon: Shield },
    { value: "€127M", label: "Assets Under Management", icon: Quote }
  ];

  const sectionClasses = {
    background: theme === 'dark' 
      ? 'bg-gray-800 text-white' 
      : 'bg-white text-gray-900',
    card: theme === 'dark' 
      ? 'bg-gray-900 border-gray-700' 
      : 'bg-gray-50 border-gray-200'
  };

  return (
    <section className={`py-20 ${sectionClasses.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${animations.fadeIn}`}>
          <h2 className={`${typography.h2(theme)} mb-6`}>
            Trusted by Verified Investors
          </h2>
          <p className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto text-gray-600 dark:text-gray-300`}>
            Join a community of sophisticated investors who value transparency, 
            governance participation, and regulated real estate investment opportunities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 ${animations.slideUp} ${animations['delay-200']}`}>
          {stats.map(({ value, label, icon: Icon }, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <Icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id}
              testimonial={testimonial}
              theme={theme}
              animationDelay={index * 200}
              cardClasses={sectionClasses.card}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial, theme, animationDelay, cardClasses }) => {
  return (
    <div 
      className={`p-6 rounded-2xl border ${cardClasses} ${animations.slideUp} relative`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Quote Icon */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <Quote className="h-4 w-4 text-white" />
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
        <span className="ml-2 text-sm text-gray-500">({testimonial.rating}/5)</span>
      </div>

      {/* Testimonial Text */}
      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
        "{testimonial.text}"
      </blockquote>

      {/* Highlight */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          ✨ {testimonial.highlight}
        </span>
      </div>

      {/* User Info */}
      <div className="flex items-center">
        <img 
          src={testimonial.avatar} 
          alt={testimonial.name}
          className="w-12 h-12 rounded-full mr-4"
          loading="lazy"
        />
        <div className="flex-1">
          <div className="font-semibold text-gray-900 dark:text-white">
            {testimonial.name}
          </div>
          <div className="text-sm text-gray-500">
            {testimonial.role}
          </div>
          <div className="text-xs text-gray-400">
            {testimonial.location}
          </div>
        </div>
      </div>

      {/* Member Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{testimonial.nftCount}</span>
          <span>{testimonial.joinDate}</span>
        </div>
      </div>
    </div>
  );
};

TestimonialCard.propTypes = {
  testimonial: PropTypes.object.isRequired,
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  animationDelay: PropTypes.number.isRequired,
  cardClasses: PropTypes.string.isRequired,
};

TestimonialsSection.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
};

export default TestimonialsSection;