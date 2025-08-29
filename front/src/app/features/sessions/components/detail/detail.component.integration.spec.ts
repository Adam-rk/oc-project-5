import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DetailComponent } from './detail.component';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';

describe('DetailComponent Integration Tests', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  // We don't need httpTestingController since we're mocking all services
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let router: Router;
  let matSnackBar: MatSnackBar;

  // Mock data
  const mockSessionId = '1';
  const mockUserId = '2';

  const mockSessionInformation: SessionInformation = {
    token: 'fake-token',
    type: 'Bearer',
    id: 2,
    username: 'user@test.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  const mockAdminSessionInformation: SessionInformation = {
    ...mockSessionInformation,
    admin: true
  };

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'Relaxing yoga session',
    date: new Date('2025-01-01'),
    teacher_id: 3,
    users: [1, 2, 3],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockSessionWithoutUser: Session = {
    ...mockSession,
    users: [1, 3]
  };

  const mockTeacher: Teacher = {
    id: 3,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  // Configure TestBed for each test case
  function configureTestBed(isAdmin: boolean = false, isParticipating: boolean = true) {
    TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      providers: [
        {
          provide: SessionService,
          useValue: {
            sessionInformation: isAdmin ? mockAdminSessionInformation : mockSessionInformation
          }
        },
        {
          provide: SessionApiService,
          useValue: {
            detail: jest.fn().mockReturnValue(of(isParticipating ? mockSession : mockSessionWithoutUser)),
            delete: jest.fn().mockReturnValue(of({})),
            participate: jest.fn().mockReturnValue(of({})),
            unParticipate: jest.fn().mockReturnValue(of({}))
          }
        },
        {
          provide: TeacherService,
          useValue: {
            detail: jest.fn().mockReturnValue(of(mockTeacher))
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue(mockSessionId)
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: jest.fn()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // To handle fxLayout directives
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);
    
    fixture.detectChanges();
  }

  // No global beforeEach needed as we're configuring TestBed in each test

  it('should create', async () => {
    await configureTestBed();
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should display session name in the title', async () => {
      await configureTestBed();
      const titleElement = fixture.debugElement.query(By.css('mat-card-title h1'));
      expect(titleElement.nativeElement.textContent).toBe(mockSession.name);
    });

    it('should display teacher name in the subtitle', async () => {
      await configureTestBed();
      const subtitleElement = fixture.debugElement.query(By.css('mat-card-subtitle span'));
      expect(subtitleElement.nativeElement.textContent.trim()).toContain(mockTeacher.firstName);
      expect(subtitleElement.nativeElement.textContent.trim()).toContain(mockTeacher.lastName.toUpperCase());
    });

    it('should display session details including attendees and date', async () => {
      await configureTestBed();
      const attendeesElement = fixture.debugElement.query(By.css('mat-card-content div span'));
      expect(attendeesElement.nativeElement.textContent.trim()).toBe(`${mockSession.users.length} attendees`);
      
      // Instead of checking for exact date format, check if the date is displayed in any format
      // by looking for the year and month which should be part of any date format
      const dateYear = new Date(mockSession.date).getFullYear().toString();
      const dateMonth = new Date(mockSession.date).toLocaleString('en-US', { month: 'long' });
      
      const cardContent = fixture.debugElement.query(By.css('mat-card-content')).nativeElement.textContent;
      expect(cardContent).toContain(dateYear);
      expect(cardContent).toContain(dateMonth);
    });

    it('should display session description', async () => {
      await configureTestBed();
      const descriptionElement = fixture.debugElement.query(By.css('.description'));
      expect(descriptionElement.nativeElement.textContent).toContain(mockSession.description);
    });

    it('should display back button', async () => {
      await configureTestBed();
      const backButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      expect(backButton).toBeTruthy();
      expect(backButton.query(By.css('mat-icon')).nativeElement.textContent).toBe('arrow_back');
    });
  });

  describe('Admin vs Non-Admin UI', () => {
    it('should display delete button for admin users', async () => {
      await configureTestBed(true); // Admin user
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      expect(deleteButton).toBeTruthy();
      expect(deleteButton.nativeElement.textContent).toContain('Delete');
    });

    it('should not display delete button for non-admin users', async () => {
      await configureTestBed(false); // Non-admin user
      // Look specifically for the delete button with text content that includes 'Delete'
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"][mat-raised-button]'));
      const isDeleteButton = deleteButton ? 
        deleteButton.nativeElement.textContent.includes('Delete') : false;
      expect(isDeleteButton).toBeFalsy();
    });

    it('should display participation buttons for non-admin users', async () => {
      await configureTestBed(false); // Non-admin user
      const participationButtons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
      expect(participationButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Participation Buttons', () => {
    it('should display "Participate" button when user is not participating', async () => {
      await configureTestBed(false, false); // Non-admin, not participating
      const participateButton = fixture.debugElement.query(By.css('button[color="primary"]'));
      expect(participateButton).toBeTruthy();
      expect(participateButton.nativeElement.textContent).toContain('Participate');
    });

    it('should display "Do not participate" button when user is already participating', async () => {
      await configureTestBed(false, true); // Non-admin, participating
      const unParticipateButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      expect(unParticipateButton).toBeTruthy();
      expect(unParticipateButton.nativeElement.textContent).toContain('Do not participate');
    });

    it('should call participate method when participate button is clicked', async () => {
      await configureTestBed(false, false); // Non-admin, not participating
      const participateSpy = jest.spyOn(component, 'participate');
      
      const participateButton = fixture.debugElement.query(By.css('button[color="primary"]'));
      participateButton.triggerEventHandler('click', null);
      
      expect(participateSpy).toHaveBeenCalled();
      expect(sessionApiService.participate).toHaveBeenCalledWith(mockSessionId, mockUserId);
    });

    it('should call unParticipate method when "Do not participate" button is clicked', async () => {
      await configureTestBed(false, true); // Non-admin, participating
      const unParticipateSpy = jest.spyOn(component, 'unParticipate');
      
      const unParticipateButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      unParticipateButton.triggerEventHandler('click', null);
      
      expect(unParticipateSpy).toHaveBeenCalled();
      expect(sessionApiService.unParticipate).toHaveBeenCalledWith(mockSessionId, mockUserId);
    });
  });

  describe('Delete Functionality', () => {
    it('should call delete method when delete button is clicked by admin', async () => {
      await configureTestBed(true); // Admin user
      const deleteSpy = jest.spyOn(component, 'delete');
      
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      deleteButton.triggerEventHandler('click', null);
      
      expect(deleteSpy).toHaveBeenCalled();
      expect(sessionApiService.delete).toHaveBeenCalledWith(mockSessionId);
      expect(matSnackBar.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('Navigation', () => {
    it('should call window.history.back when back button is clicked', async () => {
      await configureTestBed();
      const historySpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
      
      const backButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      backButton.triggerEventHandler('click', null);
      
      expect(historySpy).toHaveBeenCalled();
      
      // Restore original implementation
      historySpy.mockRestore();
    });
  });
});
