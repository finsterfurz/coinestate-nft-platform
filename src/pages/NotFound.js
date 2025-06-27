import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { Home, ArrowLeft, Search, Building, Info } from '../components/icons';

const NotFoundPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  const popularPages = [
    {
      name: 'Homepage',
      path: '/',
      icon: Home,
      description: 'Explore CoinEstate NFT Platform'
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: Building,
      description: 'Browse available real estate projects'
    },
    {
      name: 'How It Works',
      path: '/how-it-works',
      icon: Info,
      description: 'Learn about our governance model'
    },
    {
      name: 'About',
      path: '/about',
      icon: Info,
      description: 'Learn more about CoinEstate'
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>Page Not Found - CoinEstate NFT Platform</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore our real estate NFT governance platform." />
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className={`min-h-screen flex items-center justify-center px-4 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-2xl w-full text-center">
          {/* 404 Hero Section */}
          <div className="mb-12">
            {/* Large 404 */}
            <div className={`text-8xl md:text-9xl font-bold mb-4 ${
              darkMode ? 'text-gray-800' : 'text-gray-200'
            }`}>
              404
            </div>
            
            {/* Main heading */}
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Page Not Found
            </h1>
            
            {/* Description */}
            <p className={`text-lg mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              The page <code className={`px-2 py-1 rounded text-sm font-mono ${
                darkMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'
              }`}>
                {location.pathname}
              </code> doesn't exist.
            </p>
            
            <p className={`text-base ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              The page you're looking for might have been moved, deleted, or doesn't exist.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={goBack}
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
            
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          {/* Popular pages section */}
          <div className={`rounded-xl p-8 ${
            darkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}>
            <h2 className={`text-xl font-semibold mb-6 flex items-center justify-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Search className="h-5 w-5 mr-2" />
              Popular Pages
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularPages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link
                    key={page.path}
                    to={page.path}
                    className={`flex items-start p-4 rounded-lg transition-colors ${
                      darkMode 
                        ? 'hover:bg-gray-700/50 border border-gray-700/50' 
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mr-3 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <div className="text-left">
                      <h3 className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {page.name}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {page.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Help section */}
          <div className="mt-8">
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Still can't find what you're looking for?{' '}
              <Link 
                to="/contact" 
                className={`underline ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
