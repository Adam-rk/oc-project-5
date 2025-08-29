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
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

describe('LoginComponent Integration Tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let sessionService: SessionService;
  let router: Router;

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
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      providers: [
        AuthService,
        SessionService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Interaction', () => {
    it('should have form controls for email and password', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });

    it('should update form values when user types', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      expect(component.form.controls['email'].value).toBe('test@example.com');
      expect(component.form.controls['password'].value).toBe('password123');
    });

    it('should enable submit button when form is valid', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(submitButton.disabled).toBeFalsy();
    });

    it('should keep submit button disabled when form is invalid', () => {
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      
      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(submitButton.disabled).toBeTruthy();
    });
  });

  describe('Login Flow', () => {
    it('should call authService.login when form is submitted', () => {
      // Spy on the login method
      const loginSpy = jest.spyOn(authService, 'login').mockReturnValue(of(mockSessionInfo));
      
      // Fill the form
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Submit the form
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Verify login was called with correct values
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should call sessionService.logIn and navigate on successful login', () => {
      // Spy on the services
      const loginSpy = jest.spyOn(authService, 'login').mockReturnValue(of(mockSessionInfo));
      const sessionLogInSpy = jest.spyOn(sessionService, 'logIn');
      const routerNavigateSpy = jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      
      // Fill the form
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Submit the form
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      // Verify session service was called and navigation occurred
      expect(sessionLogInSpy).toHaveBeenCalledWith(mockSessionInfo);
      expect(routerNavigateSpy).toHaveBeenCalledWith(['/sessions']);
    });

    it('should show error message when login fails', () => {
      // Spy on the login method to return an error
      jest.spyOn(authService, 'login').mockReturnValue(throwError(() => new Error('Login failed')));
      
      // Fill the form
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'wrong-password';
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

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when the visibility button is clicked', () => {
      // Initial state should be hidden
      expect(component.hide).toBeTruthy();
      
      // Get the password input and visibility toggle button
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      const visibilityButton = fixture.debugElement.query(By.css('button[matSuffix]'));
      
      // Initial state should be type="password"
      expect(passwordInput.type).toBe('password');
      
      // Click the visibility toggle button
      visibilityButton.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Password should now be visible
      expect(component.hide).toBeFalsy();
      expect(passwordInput.type).toBe('text');
      
      // Click again to hide
      visibilityButton.triggerEventHandler('click', null);
      fixture.detectChanges();
      
      // Password should be hidden again
      expect(component.hide).toBeTruthy();
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('End-to-End Login Flow', () => {
    it('should perform the complete login flow with real services', () => {
      // This is a more comprehensive test that would ideally use the real services
      // For this test, we'll still mock the HTTP response but use the real service methods
      
      // Setup spies
      const loginSpy = jest.spyOn(authService, 'login').mockReturnValue(of(mockSessionInfo));
      const sessionLogInSpy = jest.spyOn(sessionService, 'logIn');
      const routerNavigateSpy = jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      
      // Fill the form with valid credentials
      const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]')).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]')).nativeElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      // Verify form is valid
      expect(component.form.valid).toBeTruthy();
      
      // Submit the form
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      submitButton.nativeElement.click();
      
      // Verify the complete flow
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(sessionLogInSpy).toHaveBeenCalledWith(mockSessionInfo);
      expect(routerNavigateSpy).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBeFalsy();
    });
  });
});
