// src/pages/Projects.js
import React from 'react';
import { useApp } from '../context/AppContext';
import { themes } from '../utils/themes';
import { typography } from '../utils/typography';
import { Building } from '../components/icons';

const ProjectsPage = () => {
  const { theme, projects } = useApp();
  
  return (
    <div className={`min-h-screen ${themes[theme].primary}`}>
      <section className={`pt-24 pb-12 ${themes[theme].secondary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`${typography.h1(theme)} mb-6`}>Real Estate Projects</h1>
          <p className={typography.bodyLarge(theme)}>
            Explore our portfolio of premium European real estate properties.
          </p>
        </div>
      </section>
      
      <section className={`py-16 ${themes[theme].primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.slug} className={`rounded-xl overflow-hidden shadow-lg border transition-all hover:shadow-xl ${themes[theme].card}`}>
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'Fully Allocated' ? 'bg-red-100 text-red-700' :
                      project.status === 'Available' ? 'bg-green-100 text-green-700' :
                      project.status === 'Coming Soon' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <h3 className={`${typography.h5(theme)} mb-2`}>{project.name}</h3>
                  <p className={`${typography.bodySmall(theme)} mb-4`}>{project.location}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={themes[theme].text.tertiary}>Total Value:</span>
                      <span className={themes[theme].text.primary}>€{(project.totalValue / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themes[theme].text.tertiary}>NFT Count:</span>
                      <span className={themes[theme].text.primary}>{project.nftCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themes[theme].text.tertiary}>Monthly Rent:</span>
                      <span className={themes[theme].text.primary}>€{project.monthlyRent.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-1">
                    {project.highlights.map((highlight, index) => (
                      <span key={index} className={`text-xs px-2 py-1 rounded ${themes[theme].text.tertiary} bg-opacity-10`}>
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;