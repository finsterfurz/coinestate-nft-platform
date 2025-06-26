// src/components/ui/ThemeBuilder.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, X, Check } from '../components/icons/AllIcons.js';
import { themes } from '../../utils/themes';
import { typography } from '../../utils/typography';

const ThemeBuilder = () => {
  const { theme, updateState } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all duration-200 ${themes[theme].button.ghost}`}
        title="Theme Builder"
      >
        <Settings className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 top-12 w-80 rounded-xl shadow-2xl border-2 z-50 overflow-hidden ${themes[theme].card} ${themes[theme].border}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`${typography.h5(theme)} flex items-center space-x-2`}>
                  <Settings className="h-5 w-5" />
                  <span>Theme Builder</span>
                </h3>
                <button onClick={() => setIsOpen(false)} className={`p-1 rounded ${themes[theme].button.ghost}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className={typography.bodySmall(theme)}>Choose your preferred theme for the platform</p>

                <div className="grid gap-3">
                  {Object.entries(themes).map(([themeKey, themeConfig]) => {
                    const Icon = themeConfig.icon;
                    const isActive = theme === themeKey;
                    
                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          updateState({ theme: themeKey });
                          setIsOpen(false);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-4 ${
                          isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : `${themes[theme].border} hover:border-blue-300`
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : themes[theme].secondary}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className={`font-semibold ${themes[theme].text.primary}`}>{themeConfig.name}</div>
                          <div className={`text-sm ${themes[theme].text.tertiary}`}>
                            {themeKey === 'light' && 'Clean and bright interface'}
                            {themeKey === 'dark' && 'Easy on the eyes'}
                            {themeKey === 'coinblue' && 'Premium blue aesthetic'}
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <div className={`w-4 h-4 rounded-full ${
                            themeKey === 'light' ? 'bg-white border-2 border-gray-300' :
                            themeKey === 'dark' ? 'bg-gray-800' : 'bg-slate-900'
                          }`} />
                          <div className={`w-4 h-4 rounded-full ${
                            themeKey === 'light' ? 'bg-gray-100' :
                            themeKey === 'dark' ? 'bg-gray-700' : 'bg-blue-950'
                          }`} />
                          <div className="w-4 h-4 rounded-full bg-blue-500" />
                        </div>

                        {isActive && <Check className="h-4 w-4 text-blue-500" />}
                      </button>
                    );
                  })}
                </div>

                <div className={`mt-6 p-4 rounded-lg border ${themes[theme].card} ${themes[theme].border}`}>
                  <div className={`text-sm font-medium mb-2 ${themes[theme].text.primary}`}>Live Preview</div>
                  <div className={`${themes[theme].primary} p-3 rounded border ${themes[theme].border}`}>
                    <div className={`text-sm font-semibold mb-1 ${themes[theme].text.primary}`}>Sample Card</div>
                    <div className={`text-xs ${themes[theme].text.secondary}`}>This is how your content will look</div>
                    <div className={`mt-2 inline-flex px-2 py-1 rounded text-xs ${themes[theme].button.primary}`}>Action Button</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeBuilder;