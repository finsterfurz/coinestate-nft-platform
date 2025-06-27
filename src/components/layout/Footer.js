import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building, Shield, Key, Globe } from '../icons/AllIcons.js';

// ==================== FOOTER ====================
const Footer = () => {
  const { updateState, theme } = useApp();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">CoinEstate</span>
              <span className="text-sm bg-blue-900 text-blue-300 px-2 py-1 rounded-full">NFT</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              NFT-based real estate dashboard access under Cayman Islands regulatory framework.
            </p>
            <div className="text-sm text-gray-500">
              <p>CoinEstate Foundation</p>
              <p>George Town, Cayman Islands</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-2">
              {[
                { page: 'dashboard', label: 'Dashboard' },
                { page: 'projects', label: 'Projects' },
                { page: 'how-it-works', label: 'How It Works' },
                { page: 'about', label: 'About' }
              ].map(({ page, label }) => (
                <li key={page}>
                  <button 
                    onClick={() => updateState({ currentPage: page })}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-white cursor-pointer transition-colors">KYC Support</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact Sales</li>
              <li className="hover:text-white cursor-pointer transition-colors">Legal</li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center space-x-2 text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>CIMA Regulated</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Key className="w-4 h-4 text-blue-400" />
              <span>KYC Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Building className="w-4 h-4 text-purple-400" />
              <span>Cayman Foundation</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Global Access</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            © 2025 CoinEstate Foundation. All rights reserved. Regulated under Cayman Islands law.
          </p>
          <p className="text-xs text-gray-500 max-w-4xl mx-auto">
            <strong>Disclaimer:</strong> CoinEstate NFTs are governance credentials only. 
            They do not represent securities or investment contracts. Community voting participation and rewards are 
            voluntary and administered under Cayman Islands regulations.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;