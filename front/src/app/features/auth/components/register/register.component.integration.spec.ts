import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { RegisterComponent } from './register.component';
import { RegisterRequest } from '../../interfaces/registerRequest.interface';

describe('RegisterComponent Integration Tests', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  const mockRegisterRequest: RegisterRequest = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password123'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      providers: [
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Interaction', () => {
    it('should have form controls for email, firstName, lastName, and password', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]'));
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]'));
      const lastNameInput = fixture.debugElement.query(By.css('input[formControlName="lastName"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      
      expect(emailInput).toBeTruthy();
      expect(firstNameInput).toBeTruthy();
      expect(lastNameInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });

    it('should update form values when user types', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]')).nativeElement;
      const lastNameInput = fixture.debugElement.query(By.css('input[formControlName="lastName"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input'));
      
      lastNameInput.value = 'User';
      lastNameInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      expect(component.form.controls['email'].value).toBe('test@example.com');
      expect(component.form.controls['firstName'].value).toBe('Test');
      expect(component.form.controls['lastName'].value).toBe('User');
      expect(component.form.controls['password'].value).toBe('password123');
    });

    it('should enable submit button when form is valid', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]')).nativeElement;
      const lastNameInput = fixture.debugElement.query(By.css('input[formControlName="lastName"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input'));
      
      lastNameInput.value = 'User';
      lastNameInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(submitButton.disabled).toBeFalsy();
    });

    it('should keep submit button disabled when form is invalid', () => {
      // Test with invalid email
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      
      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(submitButton.disabled).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.form.controls['email'];
      
      emailControl.setValue('');
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.errors?.['required']).toBeTruthy();
      
      emailControl.setValue('invalid-email');
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.errors?.['email']).toBeTruthy();
      
      emailControl.setValue('valid@email.com');
      expect(emailControl.valid).toBeTruthy();
    });

    it('should validate firstName and lastName required field', () => {
      const firstNameControl = component.form.controls['firstName'];
      const lastNameControl = component.form.controls['lastName'];
      
      // Test required validation
      firstNameControl.setValue('');
      lastNameControl.setValue('');
      expect(firstNameControl.valid).toBeFalsy();
      expect(lastNameControl.valid).toBeFalsy();
      expect(firstNameControl.errors?.['required']).toBeTruthy();
      expect(lastNameControl.errors?.['required']).toBeTruthy();
      
      // Test valid values
      firstNameControl.setValue('John');
      lastNameControl.setValue('Doe');
      expect(firstNameControl.valid).toBeTruthy();
      expect(lastNameControl.valid).toBeTruthy();
    });

    it('should validate password required field', () => {
      const passwordControl = component.form.controls['password'];
      
      passwordControl.setValue('');
      expect(passwordControl.valid).toBeFalsy();
      expect(passwordControl.errors?.['required']).toBeTruthy();
      
      passwordControl.setValue('password123');
      expect(passwordControl.valid).toBeTruthy();
    });
  });

  describe('Registration Flow', () => {
    it('should call authService.register when form is submitted', () => {
      // Spy on the register method
      const registerSpy = jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
      
      // Fill the form
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]')).nativeElement;
      const lastNameInput = fixture.debugElement.query(By.css('input[formControlName="lastName"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input'));
      
      lastNameInput.value = 'User';
      lastNameInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Submit the form
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Verify register was called with correct values
      expect(registerSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
    });

    it('should navigate to login page on successful registration', () => {
      // Spy on the services
      const registerSpy = jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
      const routerNavigateSpy = jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      
      // Fill the form
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]')).nativeElement;
      const lastNameInput = fixture.debugElement.query(By.css('input[formControlName="lastName"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input'));
      
      lastNameInput.value = 'User';
      lastNameInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Submit the form
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Verify navigation occurred
      expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should show error message when registration fails', () => {
      // Spy on the register method to return an error
      jest.spyOn(authService, 'register').mockReturnValue(throwError(() => new Error('Registration failed')));
      
      // Fill the form
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]')).nativeElement;
      const lastNameInput = fixture.debugElement.query(By.css('input[formControlName="lastName"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input'));
      
      lastNameInput.value = 'User';
      lastNameInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Submit the form
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      fixture.detectChanges();
      
      // Verify error message is displayed
      expect(component.onError).toBeTruthy();
      const errorMessage = fixture.debugElement.query(By.css('.error'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain('An error occurred');
    });
  });

  describe('End-to-End Registration Flow', () => {
    it('should perform the complete registration flow', () => {
      // Setup spies
      const registerSpy = jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
      const routerNavigateSpy = jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      
      // Fill the form with valid data
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const firstNameInput = fixture.debugElement.query(By.css('input[formControlName="firstName"]')).nativeElement;
      const lastNameInput = fixture.debugElement.query(By.css('input[formControlName="lastName"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input'));
      
      lastNameInput.value = 'User';
      lastNameInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Verify form is valid
      expect(component.form.valid).toBeTruthy();
      
      // Submit the form
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      
      // Verify the complete flow
      expect(registerSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
      expect(component.onError).toBeFalsy();
    });
  });
});
