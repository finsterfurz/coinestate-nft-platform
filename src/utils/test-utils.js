/**
 * Testing Utilities
 * Custom render functions and test helpers
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '../context/ThemeContext';
import { AppProvider } from '../context/AppContext';
import { SecurityProvider } from '../components/security/SecurityProvider';
import { HelmetProvider } from 'react-helmet-async';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Test Providers Wrapper
 * Wraps components with all necessary providers for testing
 */
const TestProviders = ({ children, initialTheme = 'light', initialAppState = {} }) => {
  return (
    <HelmetProvider>
      <SecurityProvider>
        <ThemeProvider initialTheme={initialTheme}>
          <AppProvider initialState={initialAppState}>
            {children}
          </AppProvider>
        </ThemeProvider>
      </SecurityProvider>
    </HelmetProvider>
  );
};

/**
 * Custom Render Function
 * Renders components with all providers and returns additional utilities
 */
const customRender = (ui, options = {}) => {
  const {
    initialTheme = 'light',
    initialAppState = {},
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <TestProviders 
      initialTheme={initialTheme}
      initialAppState={initialAppState}
    >
      {children}
    </TestProviders>
  );

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...renderResult,
    user: userEvent.setup(), // v14 syntax
    
    // Helper methods
    rerender: (element) => renderResult.rerender(
      <TestProviders initialTheme={initialTheme} initialAppState={initialAppState}>
        {element}
      </TestProviders>
    )
  };
};

/**
 * Accessibility Testing Helper
 */
export const testAccessibility = async (component) => {
  const { container } = customRender(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
};

/**
 * Keyboard Navigation Testing Helper
 */
export const testKeyboardNavigation = async (component, expectations = {}) => {
  const { user } = customRender(component);
  
  // Test Tab navigation
  if (expectations.tabStops) {
    for (const selector of expectations.tabStops) {
      await user.tab();
      const element = screen.getByTestId(selector) || screen.getByRole(selector);
      expect(element).toHaveFocus();
    }
  }
  
  // Test Enter key activation
  if (expectations.enterActivation) {
    for (const selector of expectations.enterActivation) {
      const element = screen.getByTestId(selector) || screen.getByRole(selector);
      element.focus();
      await user.keyboard('{Enter}');
      // Custom expectation handling would go here
    }
  }
  
  // Test Escape key
  if (expectations.escapeHandling) {
    await user.keyboard('{Escape}');
    // Custom expectation handling would go here
  }
};

/**
 * Responsive Testing Helper
 */
export const testResponsive = (component, breakpoints = ['mobile', 'tablet', 'desktop']) => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 }
  };

  const results = {};

  breakpoints.forEach(breakpoint => {
    const viewport = viewports[breakpoint];
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height
    });
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    // Render component
    const renderResult = customRender(component);
    results[breakpoint] = renderResult;
  });

  return results;
};

/**
 * Form Testing Helper
 */
export const testForm = async (formComponent, testData = {}) => {
  const { user } = customRender(formComponent);
  const results = {};

  // Fill form fields
  for (const [fieldName, value] of Object.entries(testData)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i')) ||
                  screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') }) ||
                  screen.getByTestId(fieldName);
    
    if (field) {
      await user.clear(field);
      await user.type(field, value);
      results[fieldName] = field.value;
    }
  }

  return results;
};

/**
 * Performance Testing Helper
 */
export const testPerformance = (component, expectations = {}) => {
  const startTime = performance.now();
  
  const renderResult = customRender(component);
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (expectations.maxRenderTime) {
    expect(renderTime).toBeLessThan(expectations.maxRenderTime);
  }

  return {
    ...renderResult,
    renderTime,
    performance: {
      renderTime
    }
  };
};

/**
 * Mock Functions Helper
 */
export const createMockFunctions = (functionNames = []) => {
  const mocks = {};
  functionNames.forEach(name => {
    mocks[name] = jest.fn();
  });
  return mocks;
};

/**
 * Wait for Element Helper
 */
export const waitForElement = async (selector, options = {}) => {
  const { timeout = 1000 } = options;
  
  return await waitFor(
    () => {
      const element = typeof selector === 'string' 
        ? screen.getByTestId(selector)
        : selector();
      expect(element).toBeInTheDocument();
      return element;
    },
    { timeout }
  );
};

/**
 * Theme Testing Helper
 */
export const testThemes = (component, themes = ['light', 'dark']) => {
  const results = {};
  
  themes.forEach(theme => {
    const renderResult = customRender(component, { initialTheme: theme });
    results[theme] = renderResult;
  });
  
  return results;
};

/**
 * Animation Testing Helper
 */
export const testAnimations = async (component, trigger) => {
  const { container } = customRender(component);
  
  // Initial state
  const initialClasses = container.firstChild.className;
  
  // Trigger animation
  if (typeof trigger === 'function') {
    await trigger();
  } else if (typeof trigger === 'string') {
    const element = screen.getByTestId(trigger);
    await fireEvent.click(element);
  }
  
  // Wait for animation classes
  await waitFor(() => {
    const newClasses = container.firstChild.className;
    expect(newClasses).not.toBe(initialClasses);
  });
  
  return container;
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent };

// Override render with custom render
export { customRender as render };

// Export additional utilities
export {
  TestProviders,
  testAccessibility,
  testKeyboardNavigation,
  testResponsive,
  testForm,
  testPerformance,
  createMockFunctions,
  waitForElement,
  testThemes,
  testAnimations
};