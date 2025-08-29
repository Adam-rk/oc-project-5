import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let sessionServiceMock: any;
  let routerMock: any;

  const mockSessionInfo: SessionInformation = {
    token: 'mock-jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  beforeEach(async () => {
    // Create mocks for the services
    authServiceMock = {
      login: jest.fn()
    };
    
    sessionServiceMock = {
      logIn: jest.fn()
    };
    
    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should have an invalid form when empty', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should validate email field as required', () => {
      const email = component.form.controls['email'];
      expect(email.valid).toBeFalsy();
      
      email.setValue('');
      expect(email.hasError('required')).toBeTruthy();
    });

    it('should validate email format', () => {
      const email = component.form.controls['email'];
      
      email.setValue('invalid-email');
      expect(email.hasError('email')).toBeTruthy();
      
      email.setValue('valid@example.com');
      expect(email.valid).toBeTruthy();
    });

    it('should validate password field as required', () => {
      const password = component.form.controls['password'];
      expect(password.valid).toBeFalsy();
      
      password.setValue('');
      expect(password.hasError('required')).toBeTruthy();
    });

    it('should have a valid form when all fields are properly filled', () => {
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['password'].setValue('password123');
      
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should call authService.login with form values when submitted', () => {
      // Setup successful login response
      authServiceMock.login.mockReturnValue(of(mockSessionInfo));
      
      // Fill the form
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['password'].setValue('password123');
      
      // Submit the form
      component.submit();
      
      // Verify auth service was called with correct values
      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should call sessionService.logIn with response data on successful login', () => {
      // Setup successful login response
      authServiceMock.login.mockReturnValue(of(mockSessionInfo));
      
      // Fill and submit the form
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['password'].setValue('password123');
      component.submit();
      
      // Verify session service was called with response data
      expect(sessionServiceMock.logIn).toHaveBeenCalledWith(mockSessionInfo);
    });

    it('should navigate to /sessions on successful login', () => {
      // Setup successful login response
      authServiceMock.login.mockReturnValue(of(mockSessionInfo));
      
      // Fill and submit the form
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['password'].setValue('password123');
      component.submit();
      
      // Verify navigation occurred
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should set onError to true when login fails', () => {
      // Setup error response
      authServiceMock.login.mockReturnValue(throwError(() => new Error('Login failed')));
      
      // Ensure onError is initially false
      expect(component.onError).toBeFalsy();
      
      // Fill and submit the form
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['password'].setValue('password123');
      component.submit();
      
      // Verify onError was set to true
      expect(component.onError).toBeTruthy();
      
      // Verify session service and router were not called
      expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('UI Interaction', () => {
    it('should toggle password visibility when the visibility button is clicked', () => {
      // Initial state should be hidden
      expect(component.hide).toBeTruthy();
      
      // Simulate clicking the visibility toggle button
      component.hide = !component.hide;
      
      // Password should now be visible
      expect(component.hide).toBeFalsy();
    });
  });
});
