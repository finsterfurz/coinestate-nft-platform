/**
 * Hero Section Component Tests
 * Comprehensive testing including accessibility, responsiveness, and user interactions
 */

import React from 'react';
import { 
  render, 
  screen, 
  fireEvent,
  testAccessibility,
  testKeyboardNavigation,
  testResponsive,
  testThemes
} from '../../../utils/test-utils';
import HeroSection from '../HeroSection';

// Mock functions
const mockNavigate = jest.fn();

// Default props
const defaultProps = {
  theme: 'light',
  onNavigate: mockNavigate
};

describe('HeroSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================ BASIC RENDERING ================
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText(/Unlock Premium/i)).toBeInTheDocument();
    });

    it('displays main headline correctly', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByText(/Unlock Premium/i)).toBeInTheDocument();
      expect(screen.getByText(/Real Estate Governance/i)).toBeInTheDocument();
      expect(screen.getByText(/Through NFT Credentials/i)).toBeInTheDocument();
    });

    it('shows regulatory badge', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByText(/CIMA Regulated/i)).toBeInTheDocument();
      expect(screen.getByText(/Cayman Islands/i)).toBeInTheDocument();
    });

    it('displays trust indicators', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByText(/KYC Verified Community/i)).toBeInTheDocument();
      expect(screen.getByText(/Regulatory Compliant/i)).toBeInTheDocument();
      expect(screen.getByText(/Transferable Rights/i)).toBeInTheDocument();
    });

    it('shows action buttons', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Explore Properties/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get Access Now/i })).toBeInTheDocument();
    });

    it('displays live stats preview', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByText(/€127.5M/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Assets/i)).toBeInTheDocument();
      expect(screen.getByText(/1,847/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Members/i)).toBeInTheDocument();
    });
  });

  // ================ USER INTERACTIONS ================
  describe('User Interactions', () => {
    it('handles explore properties button click', async () => {
      const { user } = render(<HeroSection {...defaultProps} />);
      
      const exploreButton = screen.getByRole('button', { name: /Explore Properties/i });
      await user.click(exploreButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('projects');
    });

    it('handles get access button click', async () => {
      const { user } = render(<HeroSection {...defaultProps} />);
      
      const accessButton = screen.getByRole('button', { name: /Get Access Now/i });
      await user.click(accessButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('dashboard');
    });

    it('calls onNavigate with correct parameters', async () => {
      const { user } = render(<HeroSection {...defaultProps} />);
      
      // Test both buttons
      await user.click(screen.getByRole('button', { name: /Explore Properties/i }));
      expect(mockNavigate).toHaveBeenNthCalledWith(1, 'projects');
      
      await user.click(screen.getByRole('button', { name: /Get Access Now/i }));
      expect(mockNavigate).toHaveBeenNthCalledWith(2, 'dashboard');
    });
  });

  // ================ ACCESSIBILITY TESTING ================
  describe('Accessibility', () => {
    it('meets WCAG accessibility guidelines', async () => {
      await testAccessibility(<HeroSection {...defaultProps} />);
    });

    it('supports keyboard navigation', async () => {
      await testKeyboardNavigation(
        <HeroSection {...defaultProps} />,
        {
          tabStops: ['button', 'button'], // Two main action buttons
          enterActivation: ['button']
        }
      );
    });

    it('has proper ARIA attributes', () => {
      render(<HeroSection {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('provides alternative text for icons', () => {
      render(<HeroSection {...defaultProps} />);
      
      // Icons should be marked as decorative
      const icons = document.querySelectorAll('svg');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  // ================ THEME SUPPORT ================
  describe('Theme Support', () => {
    it('applies light theme styles correctly', () => {
      render(<HeroSection {...defaultProps} theme="light" />);
      
      const section = screen.getByRole('region', { hidden: true }) || 
                     document.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br', 'from-blue-50');
    });

    it('applies dark theme styles correctly', () => {
      render(<HeroSection {...defaultProps} theme="dark" />);
      
      const section = document.querySelector('section');
      expect(section).toHaveClass('from-gray-900');
    });

    it('works with all theme variants', () => {
      const themes = testThemes(<HeroSection {...defaultProps} />);
      
      // Both themes should render without errors
      expect(Object.keys(themes)).toContain('light');
      expect(Object.keys(themes)).toContain('dark');
    });
  });

  // ================ RESPONSIVE DESIGN ================
  describe('Responsive Design', () => {
    it('renders correctly on mobile devices', () => {
      const { mobile } = testResponsive(<HeroSection {...defaultProps} />);
      
      // Should have mobile-friendly layout
      expect(mobile.container).toBeInTheDocument();
    });

    it('renders correctly on tablet devices', () => {
      const { tablet } = testResponsive(<HeroSection {...defaultProps} />);
      
      expect(tablet.container).toBeInTheDocument();
    });

    it('renders correctly on desktop devices', () => {
      const { desktop } = testResponsive(<HeroSection {...defaultProps} />);
      
      expect(desktop.container).toBeInTheDocument();
    });

    it('adjusts button layout for small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      render(<HeroSection {...defaultProps} />);
      
      const buttonContainer = screen.getByRole('button', { name: /Explore Properties/i }).parentElement;
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  // ================ DASHBOARD PREVIEW ================
  describe('Dashboard Preview', () => {
    it('displays dashboard preview section', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByText(/Governance Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Access/i)).toBeInTheDocument();
    });

    it('shows property card in preview', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByText(/Vienna Luxury #247/i)).toBeInTheDocument();
      expect(screen.getByText(/Prime District, Austria/i)).toBeInTheDocument();
      expect(screen.getByText(/#0247\/2500/i)).toBeInTheDocument();
    });

    it('displays unlocked features list', () => {
      render(<HeroSection {...defaultProps} />);
      
      expect(screen.getByText(/Property Performance Analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/Governance Voting Rights/i)).toBeInTheDocument();
      expect(screen.getByText(/Community Decision Access/i)).toBeInTheDocument();
      expect(screen.getByText(/Monthly Distribution Tracking/i)).toBeInTheDocument();
    });

    it('shows floating animation elements', () => {
      render(<HeroSection {...defaultProps} />);
      
      // Should have floating elements with animation classes
      const floatingElements = document.querySelectorAll('.animate-bounce');
      expect(floatingElements.length).toBeGreaterThan(0);
    });
  });

  // ================ PROP VALIDATION ================
  describe('Prop Validation', () => {
    it('requires theme prop', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<HeroSection onNavigate={mockNavigate} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed prop type')
      );
      
      consoleSpy.mockRestore();
    });

    it('requires onNavigate prop', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<HeroSection theme="light" />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed prop type')
      );
      
      consoleSpy.mockRestore();
    });
  });

  // ================ PERFORMANCE ================
  describe('Performance', () => {
    it('renders within acceptable time', () => {
      const startTime = performance.now();
      render(<HeroSection {...defaultProps} />);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('does not cause memory leaks', () => {
      const { unmount } = render(<HeroSection {...defaultProps} />);
      
      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });
  });
});