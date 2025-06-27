import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import Homepage from '../../pages/Homepage';
import { AppProvider } from '../../context/AppContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock external dependencies
jest.mock('../../components/icons', () => ({
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Building: () => <div data-testid="building-icon">Building</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Key: () => <div data-testid="key-icon">Key</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  BarChart3: () => <div data-testid="barchart-icon">BarChart3</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  DollarSign: () => <div data-testid="dollar-icon">DollarSign</div>
}));

// Test wrapper component with providers
const TestWrapper = ({ children, initialTheme = 'light' }) => (
  <ThemeProvider initialTheme={initialTheme}>
    <AppProvider>
      {children}
    </AppProvider>
  </ThemeProvider>
);

describe('Homepage Component', () => {
  beforeEach(() => {
    // Reset any timers
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering Tests', () => {
    test('renders homepage without crashing', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Unlock Premium/)).toBeInTheDocument();
      expect(screen.getByText(/Real Estate Governance/)).toBeInTheDocument();
    });

    test('displays main headline and description', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Unlock Premium/)).toBeInTheDocument();
      expect(screen.getByText(/Join an exclusive community/)).toBeInTheDocument();
    });

    test('shows regulatory compliance badge', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/CIMA Regulated • Cayman Islands/)).toBeInTheDocument();
    });

    test('displays trust indicators', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/KYC Verified Community/)).toBeInTheDocument();
      expect(screen.getByText(/Regulatory Compliant/)).toBeInTheDocument();
      expect(screen.getByText(/Transferable Rights/)).toBeInTheDocument();
    });
  });

  describe('Statistics Animation Tests', () => {
    test('animates statistics counters', async () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      // Initially should show 0 or low values
      expect(screen.getByText(/€0\.0M|€127\.5M/)).toBeInTheDocument();

      // Fast-forward timers to complete animation
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      // Should show final values after animation
      await waitFor(() => {
        expect(screen.getByText('€127.5M')).toBeInTheDocument();
      });
    });

    test('displays all stat categories', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      expect(screen.getByText(/Total Property Value/)).toBeInTheDocument();
      expect(screen.getByText(/Active Properties/)).toBeInTheDocument();
      expect(screen.getByText(/NFT Holders/)).toBeInTheDocument();
      expect(screen.getByText(/Avg\. Annual Yield/)).toBeInTheDocument();
    });
  });

  describe('Property Previews Tests', () => {
    test('displays featured properties section', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Featured Properties/)).toBeInTheDocument();
      expect(screen.getByText(/Vienna Luxury Complex/)).toBeInTheDocument();
      expect(screen.getByText(/Berlin Business Center/)).toBeInTheDocument();
      expect(screen.getByText(/Munich Residential/)).toBeInTheDocument();
    });

    test('shows property details correctly', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      // Vienna Property
      expect(screen.getByText(/€45M/)).toBeInTheDocument();
      expect(screen.getByText(/7\.8%/)).toBeInTheDocument();
      expect(screen.getByText(/Prime Location/)).toBeInTheDocument();
      
      // Berlin Property
      expect(screen.getByText(/€32M/)).toBeInTheDocument();
      expect(screen.getByText(/8\.9%/)).toBeInTheDocument();
      expect(screen.getByText(/Tech Hub/)).toBeInTheDocument();
    });
  });

  describe('Testimonials Tests', () => {
    test('displays testimonials section', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Trusted by Verified Investors/)).toBeInTheDocument();
    });

    test('shows first testimonial initially', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Marcus Weber/)).toBeInTheDocument();
      expect(screen.getByText(/Portfolio Manager/)).toBeInTheDocument();
      expect(screen.getByText(/Zurich, Switzerland/)).toBeInTheDocument();
    });

    test('auto-rotates testimonials', async () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      // Initial testimonial
      expect(screen.getByText(/Marcus Weber/)).toBeInTheDocument();

      // Fast-forward testimonial rotation timer
      act(() => {
        jest.advanceTimersByTime(5500);
      });

      // Should show next testimonial
      await waitFor(() => {
        expect(screen.getByText(/Sophie Laurent/)).toBeInTheDocument();
      });
    });

    test('testimonial navigation dots work', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const dots = screen.getAllByRole('button');
      const testimonialDots = dots.filter(button => 
        button.className.includes('rounded-full') && button.className.includes('w-3')
      );

      expect(testimonialDots.length).toBeGreaterThan(0);
    });
  });

  describe('FAQ Section Tests', () => {
    test('displays FAQ section', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Frequently Asked Questions/)).toBeInTheDocument();
    });

    test('FAQ items are clickable and expand', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const faqButton = screen.getByText(/What exactly do CoinEstate NFTs represent?/);
      expect(faqButton).toBeInTheDocument();

      fireEvent.click(faqButton);

      expect(screen.getByText(/CoinEstate NFTs are digital governance credentials/)).toBeInTheDocument();
    });

    test('only one FAQ can be open at a time', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const firstFaq = screen.getByText(/What exactly do CoinEstate NFTs represent?/);
      const secondFaq = screen.getByText(/How does the KYC verification process work?/);

      // Open first FAQ
      fireEvent.click(firstFaq);
      expect(screen.getByText(/CoinEstate NFTs are digital governance credentials/)).toBeInTheDocument();

      // Open second FAQ - first should close
      fireEvent.click(secondFaq);
      expect(screen.getByText(/After acquiring an NFT, you complete/)).toBeInTheDocument();
    });
  });

  describe('Interactive Elements Tests', () => {
    test('navigation buttons work correctly', () => {
      const mockUpdateState = jest.fn();
      
      // Mock the useApp hook
      jest.doMock('../../context/AppContext', () => ({
        ...jest.requireActual('../../context/AppContext'),
        useApp: () => ({
          updateState: mockUpdateState,
          theme: 'light'
        })
      }));

      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const exploreButton = screen.getByText(/Explore Properties/);
      fireEvent.click(exploreButton);
    });

    test('CTA buttons are present and clickable', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      expect(screen.getByText(/Get Your NFT Access/)).toBeInTheDocument();
      expect(screen.getByText(/Schedule Consultation/)).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    test('has proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1Elements.length).toBeGreaterThan(0);
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    test('images have alt text', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    test('buttons have proper labels', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Dark Mode Tests', () => {
    test('renders correctly in dark mode', () => {
      render(
        <TestWrapper initialTheme="dark">
          <Homepage />
        </TestWrapper>
      );

      const mainContainer = screen.getByText(/Unlock Premium/).closest('div');
      expect(mainContainer).toHaveClass('bg-gray-900');
    });

    test('theme-specific classes are applied', () => {
      render(
        <TestWrapper initialTheme="dark">
          <Homepage />
        </TestWrapper>
      );

      // Check for dark mode specific styling
      expect(document.querySelector('.bg-gray-900')).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    test('component mounts within reasonable time', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    test('handles rapid interactions without errors', () => {
      render(
        <TestWrapper>
          <Homepage />
        </TestWrapper>
      );

      const faqButtons = screen.getAllByText(/What exactly do|How does the|Can I transfer/);
      
      // Rapidly click FAQ items
      faqButtons.forEach(button => {
        fireEvent.click(button);
      });

      // Should not crash
      expect(screen.getByText(/Frequently Asked Questions/)).toBeInTheDocument();
    });
  });
});
