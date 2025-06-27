import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import HeroSection from '../HeroSection';

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

// Mock the icons
jest.mock('../../icons', () => ({
  Shield: ({ className }) => <div data-testid="shield-icon" className={className} />,
  Check: ({ className }) => <div data-testid="check-icon" className={className} />,
  Award: ({ className }) => <div data-testid="award-icon" className={className} />,
  Building: ({ className }) => <div data-testid="building-icon" className={className} />,
  Key: ({ className }) => <div data-testid="key-icon" className={className} />,
  ArrowRight: ({ className }) => <div data-testid="arrow-right-icon" className={className} />
}));

// Mock typography utils
jest.mock('../../../utils/typography', () => ({
  typography: {
    h1: jest.fn((theme) => `h1-${theme}`),
    bodyLarge: jest.fn((theme) => `body-large-${theme}`)
  }
}));

// Mock CSS modules
jest.mock('../../../styles/animations.module.css', () => ({
  pulseSlow: 'pulse-slow-class',
  fadeIn: 'fade-in-class',
  slideUp: 'slide-up-class',
  slideIn: 'slide-in-class',
  bounceSubtle: 'bounce-subtle-class',
  'delay-200': 'delay-200-class',
  'delay-300': 'delay-300-class',
  'delay-500': 'delay-500-class',
  'delay-1000': 'delay-1000-class'
}));

jest.mock('../../../styles/components.module.css', () => ({
  button: 'button-class',
  buttonPrimary: 'button-primary-class',
  buttonSecondary: 'button-secondary-class',
  buttonSecondaryDark: 'button-secondary-dark-class',
  statsCard: 'stats-card-class',
  statsCardLight: 'stats-card-light-class',
  statsCardDark: 'stats-card-dark-class',
  card: 'card-class',
  cardLight: 'card-light-class',
  cardDark: 'card-dark-class',
  badge: 'badge-class',
  badgeSuccess: 'badge-success-class'
}));

describe('HeroSection Component', () => {
  const defaultProps = {
    theme: 'light',
    onNavigate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('Unlock Premium')).toBeInTheDocument();
    });

    test('displays main headline correctly', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('Unlock Premium')).toBeInTheDocument();
      expect(screen.getByText('Real Estate Governance')).toBeInTheDocument();
      expect(screen.getByText('Through NFT Credentials')).toBeInTheDocument();
    });

    test('shows regulatory badge with correct text', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('CIMA Regulated • Cayman Islands')).toBeInTheDocument();
    });

    test('displays trust indicators', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('KYC Verified Community')).toBeInTheDocument();
      expect(screen.getByText('Regulatory Compliant')).toBeInTheDocument();
      expect(screen.getByText('Transferable Rights')).toBeInTheDocument();
    });

    test('shows action buttons', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('Explore Properties')).toBeInTheDocument();
      expect(screen.getByText('Get Access Now')).toBeInTheDocument();
    });

    test('displays stats preview', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('€127.5M')).toBeInTheDocument();
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
      expect(screen.getByText('1,847')).toBeInTheDocument();
      expect(screen.getByText('Active Members')).toBeInTheDocument();
    });

    test('shows dashboard preview', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('Governance Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Active Access')).toBeInTheDocument();
      expect(screen.getByText('Vienna Luxury #247')).toBeInTheDocument();
      expect(screen.getByText('Prime District, Austria')).toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    test('applies light theme classes correctly', () => {
      const { container } = render(<HeroSection {...defaultProps} theme="light" />);
      expect(container.querySelector('.bg-gradient-to-br.from-blue-50')).toBeInTheDocument();
    });

    test('applies dark theme classes correctly', () => {
      const { container } = render(<HeroSection {...defaultProps} theme="dark" />);
      expect(container.querySelector('.bg-gradient-to-br.from-gray-900')).toBeInTheDocument();
    });

    test('uses correct button styling for light theme', () => {
      render(<HeroSection {...defaultProps} theme="light" />);
      const secondaryButton = screen.getByText('Get Access Now').closest('button');
      expect(secondaryButton).toHaveClass('button-secondary-class');
    });

    test('uses correct button styling for dark theme', () => {
      render(<HeroSection {...defaultProps} theme="dark" />);
      const secondaryButton = screen.getByText('Get Access Now').closest('button');
      expect(secondaryButton).toHaveClass('button-secondary-dark-class');
    });
  });

  describe('Interactions', () => {
    test('calls onNavigate with "projects" when Explore Properties is clicked', () => {
      const onNavigate = jest.fn();
      render(<HeroSection {...defaultProps} onNavigate={onNavigate} />);
      
      fireEvent.click(screen.getByText('Explore Properties'));
      expect(onNavigate).toHaveBeenCalledWith('projects');
    });

    test('calls onNavigate with "dashboard" when Get Access Now is clicked', () => {
      const onNavigate = jest.fn();
      render(<HeroSection {...defaultProps} onNavigate={onNavigate} />);
      
      fireEvent.click(screen.getByText('Get Access Now'));
      expect(onNavigate).toHaveBeenCalledWith('dashboard');
    });

    test('handles multiple button clicks correctly', () => {
      const onNavigate = jest.fn();
      render(<HeroSection {...defaultProps} onNavigate={onNavigate} />);
      
      fireEvent.click(screen.getByText('Explore Properties'));
      fireEvent.click(screen.getByText('Get Access Now'));
      
      expect(onNavigate).toHaveBeenCalledTimes(2);
      expect(onNavigate).toHaveBeenNthCalledWith(1, 'projects');
      expect(onNavigate).toHaveBeenNthCalledWith(2, 'dashboard');
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(<HeroSection {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('buttons are keyboard accessible', () => {
      render(<HeroSection {...defaultProps} />);
      const exploreButton = screen.getByText('Explore Properties');
      const accessButton = screen.getByText('Get Access Now');
      
      expect(exploreButton).toHaveAttribute('type', 'button');
      expect(accessButton).toHaveAttribute('type', 'button');
    });

    test('has proper heading hierarchy', () => {
      render(<HeroSection {...defaultProps} />);
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders correctly on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })),
      });

      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('Unlock Premium')).toBeInTheDocument();
    });

    test('maintains proper layout structure', () => {
      const { container } = render(<HeroSection {...defaultProps} />);
      expect(container.querySelector('.grid.lg\\:grid-cols-2')).toBeInTheDocument();
    });
  });

  describe('Content Validation', () => {
    test('displays proper NFT and property information', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('#0247/2500')).toBeInTheDocument();
      expect(screen.getByText('€487.50')).toBeInTheDocument();
      expect(screen.getByText('1 Vote (0.04%)')).toBeInTheDocument();
    });

    test('shows unlocked features list', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText('Property Performance Analytics')).toBeInTheDocument();
      expect(screen.getByText('Governance Voting Rights')).toBeInTheDocument();
      expect(screen.getByText('Community Decision Access')).toBeInTheDocument();
      expect(screen.getByText('Monthly Distribution Tracking')).toBeInTheDocument();
    });

    test('validates financial data format', () => {
      render(<HeroSection {...defaultProps} />);
      const totalAssets = screen.getByText('€127.5M');
      const activeMembers = screen.getByText('1,847');
      const monthlyDistribution = screen.getByText('€487.50');
      
      expect(totalAssets).toBeInTheDocument();
      expect(activeMembers).toBeInTheDocument();
      expect(monthlyDistribution).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders within acceptable time frame', () => {
      const startTime = performance.now();
      render(<HeroSection {...defaultProps} />);
      const endTime = performance.now();
      
      // Should render within 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('does not cause memory leaks', () => {
      const { unmount } = render(<HeroSection {...defaultProps} />);
      unmount();
      
      // Verify cleanup
      expect(document.body.innerHTML).toBe('');
    });
  });

  describe('PropTypes Validation', () => {
    test('accepts valid theme values', () => {
      const themes = ['light', 'dark', 'blue'];
      themes.forEach(theme => {
        expect(() => {
          render(<HeroSection {...defaultProps} theme={theme} />);
        }).not.toThrow();
      });
    });

    test('requires onNavigate function', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<HeroSection theme="light" />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed prop type'),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });
  });
});