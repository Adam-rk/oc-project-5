// ***********************************************
// Custom commands for Yoga App E2E Testing
// ***********************************************

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to login as admin user
     * @example cy.loginAsAdmin()
     */
    loginAsAdmin(): Chainable<Element>;

    /**
     * Custom command to login as regular user
     * @example cy.loginAsUser()
     */
    loginAsUser(): Chainable<Element>;

    /**
     * Custom command to login with specific credentials
     * @example cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<Element>;
  }
}

// Mock session data for API responses
const mockSessions = [
  {
    id: 1,
    name: 'Yoga Session 1',
    description: 'Beginner friendly yoga session',
    date: new Date().toISOString(),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Yoga Session 2',
    description: 'Advanced yoga session',
    date: new Date().toISOString(),
    teacher_id: 2,
    users: [1, 4],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Login as admin user
Cypress.Commands.add('loginAsAdmin', () => {
  cy.intercept('POST', '/api/auth/login', {
    body: {
      id: 1,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      admin: true
    },
  }).as('loginRequest');

  cy.intercept(
    {
      method: 'GET',
      url: '/api/session',
    },
    mockSessions
  ).as('sessions');

  cy.visit('/login');
  cy.login('admin@yoga.com', 'admin123');
  cy.wait('@loginRequest');
  cy.url().should('include', '/sessions');
});

// Login as regular user
Cypress.Commands.add('loginAsUser', () => {
  cy.intercept('POST', '/api/auth/login', {
    body: {
      id: 2,
      username: 'user',
      firstName: 'Regular',
      lastName: 'User',
      admin: false
    },
  }).as('loginRequest');

  cy.intercept(
    {
      method: 'GET',
      url: '/api/session',
    },
    mockSessions
  ).as('sessions');

  cy.visit('/login');
  cy.login('user@yoga.com', 'user123');
  cy.wait('@loginRequest');
  cy.url().should('include', '/sessions');
});

// Generic login with provided credentials
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.get('input[formControlName=email]').type(email);
  cy.get('input[formControlName=password]').type(password);
  cy.get('button[type="submit"]').click();
});
