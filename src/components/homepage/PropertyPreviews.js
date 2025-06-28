import React from 'react';
import PropTypes from 'prop-types';
import { Building, Key, TrendingUp, MapPin, Users, Euro } from '../../icons';
import { typography } from '../../../utils/typography';
import animations from '../../../styles/animations.module.css';
import components from '../../../styles/components.module.css';

const PropertyPreviews = ({ theme, onNavigate }) => {
  const properties = [
    {
      id: 1,
      name: "Vienna Luxury Complex",
      location: "1st District, Vienna, Austria",
      image: "/api/placeholder/400/250",
      totalValue: "€12.5M",
      monthlyReturn: "€5,200",
      nftCount: "2,500 NFTs",
      occupancy: "98%",
      status: "Active",
      features: ["Prime Location", "Historic Building", "Full Occupancy"]
    },
    {
      id: 2,
      name: "Berlin Tech Hub",
      location: "Mitte, Berlin, Germany",
      image: "/api/placeholder/400/250",
      totalValue: "€8.7M",
      monthlyReturn: "€3,800",
      nftCount: "1,750 NFTs",
      occupancy: "94%",
      status: "Active",
      features: ["Tech Startups", "Modern Facility", "Growing District"]
    },
    {
      id: 3,
      name: "Amsterdam Waterfront",
      location: "Centrum, Amsterdam, Netherlands",
      image: "/api/placeholder/400/250",
      totalValue: "€15.2M",
      monthlyReturn: "€6,400",
      nftCount: "3,000 NFTs",
      occupancy: "100%",
      status: "Launching Soon",
      features: ["Canal View", "Heritage Protected", "Premium Location"]
    }
  ];

  const sectionClasses = {
    background: theme === 'dark' 
      ? 'bg-gray-900 text-white' 
      : 'bg-gray-50 text-gray-900',
    card: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200'
  };

  return (
    <section className={`py-20 ${sectionClasses.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 ${animations.fadeIn}`}>
          <h2 className={`${typography.h2(theme)} mb-6`}>
            Premium Property Portfolio
          </h2>
          <p className={`${typography.bodyLarge(theme)} max-w-3xl mx-auto text-gray-600 dark:text-gray-300`}>
            Explore our carefully curated selection of premium European real estate properties. 
            Each property offers NFT-based governance rights and transparent operational oversight.
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <PropertyCard 
              key={property.id}
              property={property}
              theme={theme}
              onNavigate={onNavigate}
              animationDelay={index * 200}
              cardClasses={sectionClasses.card}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-12 ${animations.slideUp} ${animations['delay-800']}`}>
          <button
            onClick={() => onNavigate('properties')}
            className={`${components.button} ${components.buttonPrimary} px-8 py-4 text-lg`}
          >
            <Building className="h-6 w-6" />
            <span>View All Properties</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const PropertyCard = ({ property, theme, onNavigate, animationDelay, cardClasses }) => {
  const statusColors = {
    'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Launching Soon': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  return (
    <div 
      className={`rounded-2xl border shadow-lg overflow-hidden ${cardClasses} ${animations.slideUp}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <img 
          src={property.image} 
          alt={property.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
            {property.status}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">{property.name}</h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>

        {/* Property Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{property.totalValue}</div>
            <div className="text-xs text-gray-500">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{property.monthlyReturn}</div>
            <div className="text-xs text-gray-500">Monthly Return</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{property.nftCount}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{property.occupancy}</div>
            <div className="text-xs text-gray-500">Occupancy</div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {property.features.map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onNavigate(`property/${property.id}`)}
          className={`w-full ${components.button} ${
            theme === 'dark' ? components.buttonSecondaryDark : components.buttonSecondary
          } py-3`}
        >
          <Key className="h-4 w-4" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
  animationDelay: PropTypes.number.isRequired,
  cardClasses: PropTypes.string.isRequired,
};

PropertyPreviews.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'blue']).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default PropertyPreviews;