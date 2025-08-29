import '../support/commands.ts';

describe('Error Handling', () => {
  describe('Navigation Errors', () => {
    it('should redirect to 404 page for non-existent routes', () => {
      // Visit a non-existent route
      cy.visit('/non-existent-route', { failOnStatusCode: false });
      
      // Verify redirect to 404 page
      cy.url().should('include', '/404');
      cy.get('h1').should('contain.text', 'Page not found');
    });
  });
});
