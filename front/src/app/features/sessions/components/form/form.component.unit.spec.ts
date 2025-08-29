import { HttpClientModule } from '@angular/common/http';
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
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let matSnackBar: MatSnackBar;

  // Mock data
  const mockSessionInformation = {
    token: 'mock-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: true
  };

  const mockNonAdminSessionInformation = {
    ...mockSessionInformation,
    admin: false
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

  beforeEach(async () => {
    const mockSessionService = {
      sessionInformation: mockSessionInformation,
      logOut: jest.fn()
    };

    const mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      create: jest.fn().mockReturnValue(of(mockSession)),
      update: jest.fn().mockReturnValue(of(mockSession))
    };

    const mockTeacherService = {
      all: jest.fn().mockReturnValue(of(mockTeachers))
    };

    const mockMatSnackBar = {
      open: jest.fn()
    };

    const mockRouter = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      url: ''
    };

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule, 
        MatSnackBarModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      declarations: [FormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    matSnackBar = TestBed.inject(MatSnackBar);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize form in create mode', () => {
      // Set router URL to create
      (router as any).url = '/sessions/create';
      
      // Initialize component
      fixture.detectChanges();
      
      // Check that we're not in update mode
      expect(component.onUpdate).toBeFalsy();
      
      // Verify form is created
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm?.get('name')).toBeDefined();
      expect(component.sessionForm?.get('date')).toBeDefined();
      expect(component.sessionForm?.get('teacher_id')).toBeDefined();
      expect(component.sessionForm?.get('description')).toBeDefined();
      
      // Verify form values are empty
      expect(component.sessionForm?.get('name')?.value).toBe('');
      expect(component.sessionForm?.get('date')?.value).toBe('');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe('');
      expect(component.sessionForm?.get('description')?.value).toBe('');
    });
    
    it('should initialize form in update mode', () => {
      // Set router URL to update
      (router as any).url = '/sessions/update/1';
      
      // Initialize component
      fixture.detectChanges();
      
      // Check that we're in update mode
      expect(component.onUpdate).toBeTruthy();
      
      // Verify session detail was called
      expect(sessionApiService.detail).toHaveBeenCalledWith('1');
      
      // Verify form is created with session values
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm?.get('name')?.value).toBe('Yoga Session');
      expect(component.sessionForm?.get('description')?.value).toBe('Beginner friendly yoga session');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(1);
    });
    
    it('should redirect non-admin users to sessions page', () => {
      // Set user as non-admin
      (sessionService as any).sessionInformation = mockNonAdminSessionInformation;
      
      // Initialize component
      fixture.detectChanges();
      
      // Verify redirect
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      // Initialize component in create mode
      (router as any).url = '/sessions/create';
      fixture.detectChanges();
    });
    
    it('should validate required fields', () => {
      // Form should be invalid initially (all fields empty)
      expect(component.sessionForm?.valid).toBeFalsy();
      
      // Fill in required fields one by one
      component.sessionForm?.get('name')?.setValue('Test Session');
      expect(component.sessionForm?.valid).toBeFalsy(); // Still invalid
      
      component.sessionForm?.get('date')?.setValue('2025-09-01');
      expect(component.sessionForm?.valid).toBeFalsy(); // Still invalid
      
      component.sessionForm?.get('teacher_id')?.setValue(1);
      expect(component.sessionForm?.valid).toBeFalsy(); // Still invalid
      
      component.sessionForm?.get('description')?.setValue('Test description');
      expect(component.sessionForm?.valid).toBeTruthy(); // Now valid
    });
    
    it('should validate description length', () => {
      // Fill in all required fields
      component.sessionForm?.get('name')?.setValue('Test Session');
      component.sessionForm?.get('date')?.setValue('2025-09-01');
      component.sessionForm?.get('teacher_id')?.setValue(1);
      
      component.sessionForm?.get('description')?.setValue('');
      expect(component.sessionForm?.get('description')?.valid).toBeFalsy();
      expect(component.sessionForm?.valid).toBeFalsy();
      
      // And valid with some content
      component.sessionForm?.get('description')?.setValue('Valid description');
      expect(component.sessionForm?.get('description')?.valid).toBeTruthy();
      expect(component.sessionForm?.valid).toBeTruthy();
    });
  });

  describe('Submit Method', () => {
    it('should create a new session when not in update mode', () => {
      // Setup create mode
      (router as any).url = '/sessions/create';
      fixture.detectChanges();
      
      // Fill form with valid data
      component.sessionForm?.get('name')?.setValue('New Session');
      component.sessionForm?.get('date')?.setValue('2025-09-01');
      component.sessionForm?.get('teacher_id')?.setValue(1);
      component.sessionForm?.get('description')?.setValue('New description');
      
      // Submit form
      component.submit();
      
      // Verify create was called with form data
      expect(sessionApiService.create).toHaveBeenCalledWith({
        name: 'New Session',
        date: '2025-09-01',
        teacher_id: 1,
        description: 'New description'
      });
      
      // Verify snackbar and navigation
      expect(matSnackBar.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
    
    it('should update an existing session when in update mode', () => {
      // Setup update mode
      (router as any).url = '/sessions/update/1';
      fixture.detectChanges();
      
      // Modify form data
      component.sessionForm?.get('name')?.setValue('Updated Session');
      component.sessionForm?.get('description')?.setValue('Updated description');
      
      // Submit form
      component.submit();
      
      // Verify update was called with form data and ID
      expect(sessionApiService.update).toHaveBeenCalledWith('1', {
        name: 'Updated Session',
        date: expect.any(String),
        teacher_id: 1,
        description: 'Updated description'
      });
      
      // Verify snackbar and navigation
      expect(matSnackBar.open).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });
    
    it('should handle errors during session creation', () => {
      // Setup create mode with error response
      (router as any).url = '/sessions/create';
      (sessionApiService.create as jest.Mock).mockReturnValue(
        throwError(() => new Error('Creation failed'))
      );
      fixture.detectChanges();
      
      // Fill form with valid data
      component.sessionForm?.get('name')?.setValue('New Session');
      component.sessionForm?.get('date')?.setValue('2025-09-01');
      component.sessionForm?.get('teacher_id')?.setValue(1);
      component.sessionForm?.get('description')?.setValue('New description');
      
      // Submit form
      component.submit();
      
      // Verify create was called
      expect(sessionApiService.create).toHaveBeenCalled();
      
      // Verify no navigation or snackbar
      expect(matSnackBar.open).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Admin-only Access', () => {
    it('should redirect non-admin users to sessions page', () => {
      // Set user as non-admin
      (sessionService as any).sessionInformation = mockNonAdminSessionInformation;
      
      // Initialize component
      fixture.detectChanges();
      
      // Verify redirect
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    });
    
    it('should allow admin users to access the form', () => {
      // Set user as admin
      (sessionService as any).sessionInformation = mockSessionInformation;
      
      // Initialize component
      fixture.detectChanges();
      
      // Verify no redirect
      expect(router.navigate).not.toHaveBeenCalledWith(['/sessions']);
      
      // Verify form is created
      expect(component.sessionForm).toBeDefined();
    });
  });
});
