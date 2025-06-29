// Responsive Testing Suite
describe('Responsive Design Tests', () => {
  const viewports = [
    { device: 'iphone-6', width: 375, height: 667 },
    { device: 'ipad-2', width: 768, height: 1024 },
    { device: 'macbook-15', width: 1440, height: 900 }
  ];

  viewports.forEach(({ device, width, height }) => {
    describe(`${device} (${width}x${height})`, () => {
      beforeEach(() => {
        cy.viewport(width, height);
        cy.visit('/');
      });

      it('should display navigation correctly', () => {
        cy.get('[data-testid="navigation"]').should('be.visible');
        
        if (width < 768) {
          cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
        } else {
          cy.get('[data-testid="desktop-menu"]').should('be.visible');
        }
      });

      it('should render hero section responsively', () => {
        cy.get('[data-testid="hero-section"]').should('be.visible');
        cy.get('[data-testid="hero-title"]').should('be.visible');
        
        // Ensure text is readable (not overlapping)
        cy.get('[data-testid="hero-title"]').should(($el) => {
          expect($el[0].scrollHeight).to.be.at.most($el[0].clientHeight + 5);
        });
      });

      it('should maintain interactive elements accessibility', () => {
        cy.get('button, a, input').each(($el) => {
          cy.wrap($el).should('have.css', 'min-height');
          const minHeight = parseInt($el.css('min-height'));
          expect(minHeight).to.be.at.least(44); // Minimum touch target
        });
      });
    });
  });
});
