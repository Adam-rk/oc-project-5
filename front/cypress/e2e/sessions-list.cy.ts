describe('Sessions List', () => {
  const mockSessions = [
    {
      id: 1,
      name: 'Yoga for beginners',
      description: 'A gentle introduction to yoga poses.',
      date: '2023-04-15',
      teacher_id: 1,
      users: [1, 2],
      createdAt: '2023-01-15T09:00:00.000Z',
      updatedAt: '2023-01-15T09:00:00.000Z'
    },
    {
      id: 2,
      name: 'Advanced Yoga',
      description: 'Complex poses for experienced practitioners.',
      date: '2023-04-22',
      teacher_id: 2,
      users: [1],
      createdAt: '2023-01-20T10:00:00.000Z',
      updatedAt: '2023-01-20T10:00:00.000Z'
    }
  ];

  const mockTeachers = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    }
  ];

  describe('Regular User View', () => {
    beforeEach(() => {
      // Mock login as regular user
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'user@example.com',
          firstName: 'Regular',
          lastName: 'User',
          admin: false
        }
      }).as('loginRequest');

      // Mock sessions data
      cy.intercept('GET', '/api/session', mockSessions).as('getSessions');
      
      // Mock teachers data
      cy.intercept('GET', '/api/teacher', mockTeachers).as('getTeachers');

      // Login and visit sessions page
      cy.visit('/login');
      cy.get('input[formControlName=email]').type('user@example.com');
      cy.get('input[formControlName=password]').type('password');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      cy.url().should('include', '/sessions');
      cy.wait('@getSessions');
    });

    it('Should display sessions list with correct data', () => {
      // Check page title
      cy.get('mat-card-title').should('contain.text', 'Rentals available');
      
      // Check that we have the correct number of sessions
      cy.get('.item').should('have.length', 2);
      
      // Check first session data
      cy.get('.item').first().within(() => {
        cy.get('mat-card-title').should('contain.text', 'Yoga for beginners');
        cy.get('mat-card-subtitle').should('contain.text', 'Session on');
        cy.get('p').should('contain.text', 'A gentle introduction to yoga poses.');
        cy.get('button').should('contain.text', 'Detail');
        cy.get('button').should('have.length', 1); // Regular users only see Detail button
      });
    });

    it('Should navigate to session detail when clicking detail button', () => {
      // Mock session detail endpoint
      cy.intercept('GET', '/api/session/1', mockSessions[0]).as('getSessionDetail');
      cy.intercept('GET', '/api/teacher/1', mockTeachers[0]).as('getTeacherDetail');

      // Click on detail button of first session
      cy.get('.item').first().within(() => {
        cy.get('button').contains('Detail').click();
      });

      // Verify navigation to detail page
      cy.url().should('include', '/sessions/detail/1');
      cy.wait('@getSessionDetail');
      cy.wait('@getTeacherDetail');
    });

    it('Should not show create and edit buttons for regular users', () => {
      // Create button should not be visible
      cy.get('button').contains('Create').should('not.exist');
      
      // Edit buttons should not be visible
      cy.get('.item').first().within(() => {
        cy.get('button').contains('Edit').should('not.exist');
      });
    });
  });

  describe('Admin User View', () => {
    beforeEach(() => {
      // Mock login as admin user
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 3,
          username: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          admin: true
        }
      }).as('loginRequest');

      // Mock sessions data
      cy.intercept('GET', '/api/session', mockSessions).as('getSessions');
      
      // Mock teachers data
      cy.intercept('GET', '/api/teacher', mockTeachers).as('getTeachers');

      // Login and visit sessions page
      cy.visit('/login');
      cy.get('input[formControlName=email]').type('admin@example.com');
      cy.get('input[formControlName=password]').type('password');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      cy.url().should('include', '/sessions');
      cy.wait('@getSessions');
    });

    it('Should display create button for admin users', () => {
      // Create button should be visible
      cy.get('button').contains('Create').should('be.visible');
    });

    it('Should display edit buttons for admin users', () => {
      // Edit buttons should be visible
      cy.get('.item').first().within(() => {
        cy.get('button').contains('Edit').should('be.visible');
      });
    });

    it('Should navigate to create form when clicking create button', () => {
      // Click on create button
      cy.get('button').contains('Create').click();
      
      // Verify navigation to create page
      cy.url().should('include', '/sessions/create');
    });

    it('Should navigate to edit form when clicking edit button', () => {
      // Mock session detail endpoint for edit
      cy.intercept('GET', '/api/session/1', mockSessions[0]).as('getSessionDetail');
      
      // Click on edit button of first session
      cy.get('.item').first().within(() => {
        cy.get('button').contains('Edit').click();
      });
      
      // Verify navigation to update page
      cy.url().should('include', '/sessions/update/1');
      cy.wait('@getSessionDetail');
    });
  });
});
