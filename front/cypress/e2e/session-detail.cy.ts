import '../support/commands.ts'
describe('Session Detail', () => {

  describe('Admin User', () => {
    it('should create a session and appears in the list', () => {
      //Mock appel pour recevoir la liste des teachers et alimenter la listbox
      cy.intercept(
        {
          method: 'GET',
          url: '/api/teacher',
        },
        [
          {
            id: 1,
            lastName: 'DELAHAYE',
            firstName: 'Margot',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 1,
            lastName: 'THIERCELIN',
            firstName: 'Hélène',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])

      //Mock pour la création (CREATE) de session
      cy.intercept(
        {
          method: 'POST',
          url: '/api/session',
        },
        {
          id: 1,
          name: 'Beginner friendly yoga session',
          description: 'Beginner friendly yoga session',
          date: new Date(2025, 8, 29),
          teacher_id: 1,
          createdAt: new Date(2025, 8, 27)
        })

      //Login as an admin
      cy.loginAsAdmin()

      // On s'attend à ce que le bouton Create soit visible
      cy.contains('span.ml1', 'Create').should('be.visible')

      // Clic sur Create
      cy.contains('span.ml1', 'Create').click()

      // On s'attend à avoir Create Session sur la page
      cy.contains('Create session').should('be.visible')

      //On remplit les champs de saisie du formulaire
      cy.get('input[formControlName=name]').type('Beginner friendly yoga session')
      cy.get('input[formControlName=date]').type('2025-08-29')
      cy.get('mat-select[formControlName=teacher_id]').click().get('mat-option').contains('Margot DELAHAYE').click()
      cy.get('textarea[formControlName=description]').type('Beginner friendly yoga session')

      //Mock pour la récupération des sessions
      cy.intercept(
        {
          method: 'GET',
          url: '/api/session',
        },
        {
          body: [
            {
              id: 1,
              name: 'Beginner friendly yoga session',
              description: 'Beginner friendly yoga session',
              date: new Date().toISOString(),
              teacher_id: 1,
              users: [],
            },
          ],
        })

      // Clic sur Save
      cy.get('button[type=submit]').click();

      //On s'attend à revenir la page des sessions, avoir le message Session created et voir la session créée !
      cy.url().should('include', '/sessions')
      cy.contains('Session created !').should('be.visible')
      //Temporisation de 3s pour observer le message matSnackBar
      cy.wait(3000)
      cy.contains('Beginner friendly yoga session').should('be.visible')

    })

    it('should update a session and appears in the list updated', () => {
      //Mock appel pour recevoir la liste des teachers et alimenter la listbox
      cy.intercept(
        {
          method: 'GET',
          url: '/api/teacher',
        },
        [
          {
            id: 1,
            lastName: 'DELAHAYE',
            firstName: 'Margot',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 1,
            lastName: 'THIERCELIN',
            firstName: 'Hélène',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      //Mock pour recevoir la session 1 récupérée
      cy.intercept(
        {
          method: 'GET',
          url: '/api/session/1'
        },
        {
          body: {
            id: 1,
            name: 'Beginner friendly yoga session',
            description: 'Beginner friendly yoga session',
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            teacher_id: 1,
            users: []
          },
        })

      // Clic sur Create
      cy.contains('span.ml1', 'Edit').click()

      //On remplit les champs de saisie du formulaire (ajout de 'modifiée')
      cy.get('input[formControlName=name]').type(' modifiée')
      cy.get('textarea[formControlName=description]').type(' modifiée')


      //Mock pour la récupération des sessions
      cy.intercept(
        {
          method: 'GET',
          url: '/api/session'
        },
        {
          body: [
            {
              id: 1,
              name: 'Beginner friendly yoga session',
              description: 'Beginner friendly yoga session',
              date: new Date().toISOString(),
              teacher_id: 1,
              users: [],
            },
          ],
        })

      //Mock pour la modification (UPDATE) de session
      cy.intercept(
        {
          method: 'PUT',
          url: '/api/session/1',
        },
        {
          id: 1,
          name: 'Beginner friendly yoga session',
          description: 'Beginner friendly yoga session',
          date: new Date().toISOString(),
          teacher_id: 1,
          updatedAt: new Date().toISOString()
        })

      cy.get('button[type=submit]').click();

      //On s'attend à revenir la page des sessions, avoir le message Session updated et voir la session modifiée !
      cy.url().should('include', '/sessions')
      cy.contains('Session updated !').should('be.visible')
      //Temporisation de 3s pour observer le message matSnackBar
      cy.wait(3000)
      cy.contains('Beginner friendly yoga session').should('be.visible')
    })


    it('should see the detail of a session and delete it', () => {
      //On mocke l'appel à teacher id1
      cy.intercept(
        {
          method: 'GET',
          url: '/api/teacher/1',
        },
        [
          {
            id: 1,
            lastName: 'DELAHAYE',
            firstName: 'Margot',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])

      //On mocke l'appel pour récupérer la session 1
      cy.intercept(
        {
          method: 'GET',
          url: '/api/session/1'
        },
        {
          body: {
            id: 1,
            name: 'Beginner friendly yoga session',
            description: 'Beginner friendly yoga session',
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updateAd: new Date().toISOString(),
            teacher_id: 1,
            users: []
          },
        })

      // Clic sur Detail
      cy.contains('span.ml1', 'Detail').click()

      //On s'attend à avoir les détails de la session (on vérifie la description)
      cy.contains('div.description', 'Beginner friendly yoga session').should('be.visible')

      //On mocke l'appel DELETE la session 1 (retour 200 OK attendu)
      cy.intercept('DELETE', '/api/session/1', {
        statusCode: 200
      })

      cy.intercept(
        {
          method: 'GET',
          url: '/api/session',
        },
        [])

      //Clic sur Delete
      cy.contains('span.ml1', 'Delete').click()

      //On s'attend à revenir sur la liste et avoir le message 'Session deleted !'
      cy.url().should('include', '/sessions')
      cy.contains('Session deleted !').should('be.visible')
      //Temporisation de 3s pour observer le message matSnackBar
      cy.wait(3000)
    })
  });

  describe('Regular User', () => {
    it('should participate to a session', () => {

      //Login as a user
      cy.loginAsUser()

      //On s'attend à avoir une liste de sessions
      cy.contains('Beginner friendly yoga session').should('be.visible')

      //Mock pour recevoir la session 1 récupérée
      cy.intercept(
        {
          method: 'GET',
          url: '/api/session/1'
        },
        {
          body: {
            id: 1,
            name: 'Beginner friendly yoga session',
            description: 'Beginner friendly yoga session',
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            teacher_id: 1,
            users: []
          },
        })
      //On mocke l'appel à teacher id1
      cy.intercept(
        {
          method: 'GET',
          url: '/api/teacher/1',
        },
        [
          {
            id: 1,
            lastName: 'DELAHAYE',
            firstName: 'Margot',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])

      // Clic sur Detail
      cy.contains('span.ml1', 'Detail').click()


      //On s'attend à ce que le bouton participate soit proposé
      cy.contains('span.ml1', 'Participate').should('be.visible')

      //On mock l'appel à participate
      cy.intercept('POST', '/api/session/1/participate/2', {
        statusCode: 200
      })

      //Mock pour recevoir la session 1 récupérée avec l'id 1 du user qui participe
      cy.intercept(
        {
          method: 'GET',
          url: '/api/session/1'
        },
        {
          body: {
            id: 1,
            name: 'Beginner friendly yoga session',
            description: 'Beginner friendly yoga session',
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            teacher_id: 1,
            users: [
              2
            ]
          },
        })

      //Clic sur Participate
      cy.contains('span.ml1', 'Participate').click()

      //On s'attend à ce que le bouton Do not participate soit  proposé
      cy.contains('span.ml1', 'Do not participate').should('be.visible')

      //On mock l'appel à participate
      cy.intercept('DELETE', '/api/session/1/participate/2', {
        statusCode: 200
      })

      //Mock pour recevoir la session 1 récupérée avec l'id 1 du user qui participe
      cy.intercept(
        {
          method: 'GET',
          url: '/api/session/1'
        },
        {
          body: {
            id: 1,
            name: 'Beginner friendly yoga session',
            description: 'Beginner friendly yoga session',
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            teacher_id: 1,
            users: []
          },
        })

      //Clic sur Participate
      cy.contains('span.ml1', 'Do not participate').click()

      //On s'attend à ce que le bouton Do not participate soit  proposé
      cy.contains('span.ml1', 'Participate').should('be.visible')
    })
  });
});