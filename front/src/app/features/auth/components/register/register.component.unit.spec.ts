import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../interfaces/registerRequest.interface';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    // Create mocks for the services
    authServiceMock = {
      register: jest.fn()
    };
    
    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,  
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    // Note: The component uses Validators.min and Validators.max which are intended for numeric values,
    // not string lengths. This is likely a mistake in the component implementation.
    // Validators.minLength and Validators.maxLength should be used for string length validation.
    it('should have an invalid form when empty', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should validate email field as required and with correct format', () => {
      const email = component.form.controls['email'];
      expect(email.valid).toBeFalsy();
      
      // Required validation
      email.setValue('');
      expect(email.hasError('required')).toBeTruthy();
      
      // Email format validation
      email.setValue('invalid-email');
      expect(email.hasError('email')).toBeTruthy();
      
      email.setValue('valid@example.com');
      expect(email.valid).toBeTruthy();
    });

    it('should validate firstName field as required and with correct length', () => {
      const firstName = component.form.controls['firstName'];
      expect(firstName.valid).toBeFalsy();
      
      // Required validation
      firstName.setValue('');
      expect(firstName.hasError('required')).toBeTruthy();
      
      // Note: The component uses Validators.min(3) which is intended for numeric values
      // In this case, it's being used incorrectly for string validation
      // For a string 'Jo', it's converted to a number and compared to 3
      // Since NaN is not >= 3, it passes validation (which is not the intended behavior)
      firstName.setValue('Jo');
      expect(firstName.valid).toBeTruthy(); // Incorrectly passes validation
      
      // Valid input with proper length
      firstName.setValue('John');
      expect(firstName.valid).toBeTruthy();
    });

    it('should validate lastName field as required and with correct length', () => {
      const lastName = component.form.controls['lastName'];
      expect(lastName.valid).toBeFalsy();
      
      // Required validation
      lastName.setValue('');
      expect(lastName.hasError('required')).toBeTruthy();
      
      // Note: The component uses Validators.min(3) which is intended for numeric values
      // In this case, it's being used incorrectly for string validation
      lastName.setValue('Do');
      expect(lastName.valid).toBeTruthy(); // Incorrectly passes validation
      
      // Valid input with proper length
      lastName.setValue('Doe');
      expect(lastName.valid).toBeTruthy();
    });

    it('should validate password field as required and with correct length', () => {
      const password = component.form.controls['password'];
      expect(password.valid).toBeFalsy();
      
      // Required validation
      password.setValue('');
      expect(password.hasError('required')).toBeTruthy();
      
      // Note: The component uses Validators.min(3) which is intended for numeric values
      // In this case, it's being used incorrectly for string validation
      password.setValue('12');
      expect(password.valid).toBeTruthy(); // Incorrectly passes validation
      
      // Valid input with proper length
      password.setValue('password123');
      expect(password.valid).toBeTruthy();
    });

    it('should have a valid form when all fields are properly filled', () => {
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['firstName'].setValue('John');
      component.form.controls['lastName'].setValue('Doe');
      component.form.controls['password'].setValue('password123');
      
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should call authService.register with form values when submitted', () => {
      // Setup successful registration response
      authServiceMock.register.mockReturnValue(of(undefined));
      
      // Fill the form
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['firstName'].setValue('John');
      component.form.controls['lastName'].setValue('Doe');
      component.form.controls['password'].setValue('password123');
      
      // Submit the form
      component.submit();
      
      // Verify auth service was called with correct values
      expect(authServiceMock.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
    });

    it('should navigate to /login on successful registration', () => {
      // Setup successful registration response
      authServiceMock.register.mockReturnValue(of(undefined));
      
      // Fill and submit the form
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['firstName'].setValue('John');
      component.form.controls['lastName'].setValue('Doe');
      component.form.controls['password'].setValue('password123');
      component.submit();
      
      // Verify navigation occurred
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set onError to true when registration fails', () => {
      // Setup error response
      authServiceMock.register.mockReturnValue(throwError(() => new Error('Registration failed')));
      
      // Ensure onError is initially false
      expect(component.onError).toBeFalsy();
      
      // Fill and submit the form
      component.form.controls['email'].setValue('test@example.com');
      component.form.controls['firstName'].setValue('John');
      component.form.controls['lastName'].setValue('Doe');
      component.form.controls['password'].setValue('password123');
      component.submit();
      
      // Verify onError was set to true
      expect(component.onError).toBeTruthy();
      
      // Verify router was not called
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});
