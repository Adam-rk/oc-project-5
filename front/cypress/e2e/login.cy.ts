describe('Login Flow', () => {
  beforeEach(() => {
    // Visit login page before each test
    cy.visit('/login');
    
    // Set up default session intercept
    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []
    ).as('sessions');
  });

  it('Should display login form with all elements', () => {
    // Verify all form elements are present
    cy.get('mat-card-title').should('contain.text', 'Login');
    cy.get('form').should('be.visible');
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('Should successfully login with valid credentials', () => {
    // Mock successful login response
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    }).as('loginRequest');

    // Fill form and submit
    cy.get('input[formControlName=email]').type("yoga@studio.com");
    cy.get('input[formControlName=password]').type("test!1234");
    cy.get('button[type="submit"]').click();

    // Verify request was made with correct data
    cy.wait('@loginRequest').its('request.body').should('deep.equal', {
      email: 'yoga@studio.com',
      password: 'test!1234'
    });

    // Verify redirect to sessions page
    cy.url().should('include', '/sessions');
  });

  it('Should display error message with invalid credentials', () => {
    // Mock failed login response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        error: 'Invalid Credentials'
      }
    }).as('failedLogin');

    // Fill form with invalid credentials and submit
    cy.get('input[formControlName=email]').type("wrong@email.com");
    cy.get('input[formControlName=password]').type("wrongpassword");
    cy.get('button[type="submit"]').click();

    // Wait for the request to complete
    cy.wait('@failedLogin');

    // Verify error message is displayed
    cy.get('p.error').should('be.visible');
    cy.get('p.error').should('contain.text', 'An error occurred');
    
    // Verify we stay on login page
    cy.url().should('include', '/login');
  });

  it('Should display validation errors for empty form submission', () => {
    // Check if submit button is disabled for empty form
    cy.get('button[type="submit"]').should('be.disabled');
    
    // Focus and blur fields to trigger validation
    cy.get('input[formControlName=email]').focus().blur();
    cy.get('input[formControlName=password]').focus().blur();
  });

  it('Should display validation error for invalid email format', () => {
    // Type invalid email format
    cy.get('input[formControlName=email]').type("not-an-email");
    cy.get('input[formControlName=password]').type("password123");
    
    // Verify submit button remains disabled with invalid email
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('Should navigate to sessions page after successful login', () => {
    // This test duplicates the successful login test but focuses on navigation
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    }).as('loginRequest');

    // Fill form and submit
    cy.get('input[formControlName=email]').type("yoga@studio.com");
    cy.get('input[formControlName=password]').type("test!1234");
    cy.get('button[type="submit"]').click();

    // Verify redirect to sessions page
    cy.url().should('include', '/sessions');
  });
});