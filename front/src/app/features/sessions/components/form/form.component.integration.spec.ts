import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FormComponent } from './form.component';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';

describe('FormComponent Integration Tests', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let matSnackBar: MatSnackBar;

  // Mock data
  const mockSessionInformation: SessionInformation = {
    token: 'mock-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
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
    description: 'Beginner friendly yoga session',
    date: new Date('2025-09-01'),
    teacher_id: 1,
    users: [1, 2, 3]
  };

  const mockTeachers = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' }
  ];

  function setupComponent(isAdmin: boolean = true, isUpdateMode: boolean = false) {
    // Configure router for create or update mode
    const mockRouter = {
      url: isUpdateMode ? '/sessions/update/1' : '/sessions/create',
      navigate: jest.fn().mockReturnValue(Promise.resolve(true))
    };

    // Configure route params for update mode
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1')
        }
      }
    };

    // Configure session service with admin or non-admin user
    TestBed.overrideProvider(SessionService, {
      useValue: {
        sessionInformation: isAdmin ? mockAdminSessionInformation : mockSessionInformation
      }
    });

    // Configure API services
    TestBed.overrideProvider(SessionApiService, {
      useValue: {
        detail: jest.fn().mockReturnValue(of(mockSession)),
        create: jest.fn().mockReturnValue(of(mockSession)),
        update: jest.fn().mockReturnValue(of(mockSession))
      }
    });

    TestBed.overrideProvider(TeacherService, {
      useValue: {
        all: jest.fn().mockReturnValue(of(mockTeachers))
      }
    });

    TestBed.overrideProvider(Router, { useValue: mockRouter });
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    TestBed.overrideProvider(MatSnackBar, {
      useValue: {
        open: jest.fn()
      }
    });

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    matSnackBar = TestBed.inject(MatSnackBar);
    
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule
      ],
      providers: [
        SessionService,
        SessionApiService,
        TeacherService
      ],
      schemas: [NO_ERRORS_SCHEMA] // To handle fxLayout directives
    }).compileComponents();
  });

  it('should create', () => {
    setupComponent();
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should display the form container with proper layout', () => {
      setupComponent();
      const formContainer = fixture.debugElement.query(By.css('.create'));
      expect(formContainer).toBeTruthy();
      
      const matCard = fixture.debugElement.query(By.css('mat-card'));
      expect(matCard).toBeTruthy();
    });

    it('should display "Create session" title in create mode', () => {
      setupComponent(true, false);
      const titleElement = fixture.debugElement.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toBe('Create session');
    });

    it('should display "Update session" title in update mode', () => {
      setupComponent(true, true);
      const titleElement = fixture.debugElement.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toBe('Update session');
    });

    it('should display back button that links to sessions page', () => {
      setupComponent();
      const backButton = fixture.debugElement.query(By.css('button[routerLink="/sessions"]'));
      expect(backButton).toBeTruthy();
      expect(backButton.query(By.css('mat-icon')).nativeElement.textContent).toBe('arrow_back');
    });

    it('should display form with all required fields', () => {
      setupComponent();
      
      // Check form exists
      const form = fixture.debugElement.query(By.css('form'));
      expect(form).toBeTruthy();
      
      // Check all form fields exist
      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
      expect(nameInput).toBeTruthy();
      
      const dateInput = fixture.debugElement.query(By.css('input[formControlName="date"]'));
      expect(dateInput).toBeTruthy();
      expect(dateInput.nativeElement.type).toBe('date');
      
      const teacherSelect = fixture.debugElement.query(By.css('mat-select[formControlName="teacher_id"]'));
      expect(teacherSelect).toBeTruthy();
      
      const descriptionTextarea = fixture.debugElement.query(By.css('textarea[formControlName="description"]'));
      expect(descriptionTextarea).toBeTruthy();
      
      // Check save button exists
      const saveButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(saveButton).toBeTruthy();
      expect(saveButton.nativeElement.textContent.trim()).toBe('Save');
    });
  });

  describe('Admin vs Non-Admin UI', () => {
    it('should redirect non-admin users to sessions page', () => {
      setupComponent(false);
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should allow admin users to access the form', () => {
      setupComponent(true);
      expect(router.navigate).not.toHaveBeenCalledWith(['/sessions']);
      
      const form = fixture.debugElement.query(By.css('form'));
      expect(form).toBeTruthy();
    });
  });

  describe('Form Initialization', () => {
    it('should initialize empty form in create mode', () => {
      setupComponent(true, false);
      
      expect(component.onUpdate).toBeFalsy();
      expect(component.sessionForm).toBeDefined();
      
      // Check form fields are empty
      expect(component.sessionForm?.get('name')?.value).toBe('');
      expect(component.sessionForm?.get('date')?.value).toBe('');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe('');
      expect(component.sessionForm?.get('description')?.value).toBe('');
    });

    it('should initialize form with session data in update mode', () => {
      setupComponent(true, true);
      
      expect(component.onUpdate).toBeTruthy();
      expect(sessionApiService.detail).toHaveBeenCalledWith('1');
      
      // Check form fields are filled with session data
      expect(component.sessionForm?.get('name')?.value).toBe('Yoga Session');
      expect(component.sessionForm?.get('description')?.value).toBe('Beginner friendly yoga session');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(1);
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      setupComponent();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      setupComponent();
      
      // Fill in all required fields
      component.sessionForm?.get('name')?.setValue('Test Session');
      component.sessionForm?.get('date')?.setValue('2025-09-01');
      component.sessionForm?.get('teacher_id')?.setValue(1);
      component.sessionForm?.get('description')?.setValue('Test description');
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should call create service when submitting in create mode', () => {
      setupComponent(true, false);
      
      // Fill in form
      component.sessionForm?.get('name')?.setValue('New Session');
      component.sessionForm?.get('date')?.setValue('2025-09-01');
      component.sessionForm?.get('teacher_id')?.setValue(1);
      component.sessionForm?.get('description')?.setValue('New description');
      
      // Submit form
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Verify service was called
      expect(sessionApiService.create).toHaveBeenCalledWith({
        name: 'New Session',
        date: '2025-09-01',
        teacher_id: 1,
        description: 'New description'
      });
      
      // Verify navigation and snackbar
      expect(matSnackBar.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('should call update service when submitting in update mode', () => {
      setupComponent(true, true);
      
      // Modify form data
      component.sessionForm?.get('name')?.setValue('Updated Session');
      component.sessionForm?.get('description')?.setValue('Updated description');
      
      // Submit form
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Verify service was called
      expect(sessionApiService.update).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Session',
        description: 'Updated description'
      }));
      
      // Verify navigation and snackbar
      expect(matSnackBar.open).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('Teacher Selection', () => {
    it('should load teachers from service', () => {
      setupComponent();
      
      // Verify the service was called to load teachers
      expect(teacherService.all).toHaveBeenCalled();
      
      // Verify teachers$ observable is set
      expect(component.teachers$).toBeDefined();
    });
  });
});
