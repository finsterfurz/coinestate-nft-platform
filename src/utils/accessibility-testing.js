// Accessibility Testing Utilities
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Test all pages for WCAG compliance
const testAccessibility = async (component, options = {}) => {
  const { container } = render(component);
  const results = await axe(container, {
    rules: {
      // WCAG 2.1 AA compliance
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-roles': { enabled: true },
      'alt-text': { enabled: true },
      ...options.rules
    }
  });
  
  expect(results).toHaveNoViolations();
  return results;
};

// Screen Reader Testing
export const testScreenReader = (component) => {
  const { container } = render(component);
  
  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading, index) => {
    expect(heading).toHaveAttribute('id');
    expect(heading.textContent.trim()).not.toBe('');
  });

  // Check for proper form labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const label = container.querySelector(`label[for="${input.id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();
  });

  // Check for keyboard navigation
  const interactiveElements = container.querySelectorAll(
    'button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  interactiveElements.forEach(element => {
    expect(element).toHaveAttribute('tabindex');
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      expect(element).toHaveAttribute('role');
    }
  });
};

// Color Contrast Testing
export const testColorContrast = async (component) => {
  const { container } = render(component);
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'color-contrast-enhanced': { enabled: true } // WCAG AAA
    }
  });
  
  expect(results).toHaveNoViolations();
};

// Focus Management Testing
export const testFocusManagement = (component) => {
  const { container } = render(component);
  
  // Test tab order
  const tabbableElements = container.querySelectorAll(
    'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  tabbableElements.forEach((element, index) => {
    element.focus();
    expect(document.activeElement).toBe(element);
  });
  
  // Test focus indicators
  tabbableElements.forEach(element => {
    element.focus();
    const styles = window.getComputedStyle(element, ':focus');
    const hasVisibleFocus = 
      styles.outlineWidth !== '0px' || 
      styles.boxShadow !== 'none' ||
      styles.borderColor !== 'transparent';
    
    expect(hasVisibleFocus).toBe(true);
  });
};

export { testAccessibility };
