describe('Registration Flow', () => {
  beforeEach(() => {
    // Visit register page before each test
    cy.visit('/register');
  });

  it('Should display registration form with all elements', () => {
    // Verify all form elements are present
    cy.get('mat-card-title').should('contain.text', 'Register');
    cy.get('form').should('be.visible');
    cy.get('input[formControlName=firstName]').should('be.visible');
    cy.get('input[formControlName=lastName]').should('be.visible');
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('be.disabled');
  });

  it('Should successfully register with valid data', () => {
    // Mock successful registration response
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }
    }).as('registerRequest');

    // Mock login response for redirect to login page
    cy.intercept('GET', '/api/session', []).as('sessions');

    // Fill form and submit
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john.doe@example.com');
    cy.get('input[formControlName=password]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Verify request was made with correct data
    cy.wait('@registerRequest').its('request.body').should('deep.include', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!'
    });

    // Verify redirect to login page after successful registration
    cy.url().should('include', '/login');
  });

  it('Should display validation errors for empty form', () => {
    // Check if submit button is disabled for empty form
    cy.get('button[type="submit"]').should('be.disabled');
    
    // Focus and blur fields to trigger validation
    cy.get('input[formControlName=firstName]').focus().blur();
    cy.get('input[formControlName=lastName]').focus().blur();
    cy.get('input[formControlName=email]').focus().blur();
    cy.get('input[formControlName=password]').focus().blur();
  });

  it('Should display validation error for invalid email format', () => {
    // Fill form with invalid email
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('not-an-email');
    cy.get('input[formControlName=password]').type('Password123!');
    
    // Verify submit button remains disabled with invalid email
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('Should enable submit button when all fields are valid', () => {
    // Fill form with all valid fields
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john.doe@example.com');
    cy.get('input[formControlName=password]').type('Password123!');
    
    // Verify submit button is enabled when all fields are valid
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('Should display error for existing email', () => {
    // Mock error response for existing email
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        error: 'Email already exists'
      }
    }).as('registerError');

    // Fill form and submit
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('existing@example.com');
    cy.get('input[formControlName=password]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Wait for the request to complete
    cy.wait('@registerError');

    // Verify error message is displayed
    cy.get('span.error').should('be.visible');
    cy.get('span.error').should('contain.text', 'An error occurred');
    
    // Verify we stay on register page
    cy.url().should('include', '/register');
  });
});
