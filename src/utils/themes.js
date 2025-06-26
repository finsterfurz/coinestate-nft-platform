// src/utils/themes.js
import { Sun, Moon, Building } from '../components/icons/AllIcons.js';

export const themes = {
  light: {
    name: 'Light',
    icon: Sun,
    primary: 'bg-white text-gray-900',
    secondary: 'bg-gray-50 text-gray-900',
    accent: 'bg-blue-600 text-white',
    border: 'border-gray-200',
    card: 'bg-white border-gray-200',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
      inverse: 'text-white'
    },
    button: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
    }
  },
  dark: {
    name: 'Dark',
    icon: Moon,
    primary: 'bg-gray-900 text-white',
    secondary: 'bg-gray-800 text-white',
    accent: 'bg-blue-600 text-white',
    border: 'border-gray-700',
    card: 'bg-gray-800 border-gray-700',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
      inverse: 'text-gray-900'
    },
    button: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
      ghost: 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
    }
  },
  coinblue: {
    name: 'Coin Blue',
    icon: Building,
    primary: 'bg-slate-900 text-blue-50',
    secondary: 'bg-blue-950 text-blue-50',
    accent: 'bg-blue-500 text-white',
    border: 'border-blue-800',
    card: 'bg-blue-900/50 border-blue-800',
    text: {
      primary: 'text-blue-50',
      secondary: 'text-blue-200',
      tertiary: 'text-blue-300',
      inverse: 'text-blue-900'
    },
    button: {
      primary: 'bg-blue-500 text-white hover:bg-blue-400',
      secondary: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
      ghost: 'text-blue-200 hover:text-blue-100 hover:bg-blue-800/50'
    }
  }
};