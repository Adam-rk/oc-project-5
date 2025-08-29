import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { User } from '../../interfaces/user.interface';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';
import { MeComponent } from './me.component';

describe('MeComponent Integration Tests', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let userService: UserService;
  let sessionService: SessionService;
  let router: Router;
  let matSnackBar: MatSnackBar;

  // Mock data
  const mockSessionInfo = {
    token: 'mock-jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false,
    password: 'password123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  };

  const mockAdminUser: User = {
    ...mockUser,
    admin: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSnackBarModule
      ],
      providers: [
        UserService,
        {
          provide: SessionService,
          useValue: {
            sessionInformation: mockSessionInfo,
            logOut: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);
  });

  it('should create', () => {
    jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should display user information when data is loaded', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      
      // Execute
      fixture.detectChanges();
      
      // Assert
      const nameElement = fixture.debugElement.query(By.css('p')).nativeElement;
      const emailElement = fixture.debugElement.query(By.css('p:nth-child(2)')).nativeElement;
      
      expect(nameElement.textContent).toContain('Test USER');
      expect(emailElement.textContent).toContain('test@example.com');
    });

    it('should display admin status for admin users', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockAdminUser));
      
      // Execute
      fixture.detectChanges();
      
      // Assert
      const adminElement = fixture.debugElement.query(By.css('p.my2'));
      expect(adminElement).toBeTruthy();
      expect(adminElement.nativeElement.textContent).toContain('You are admin');
    });

    it('should display delete account button for non-admin users', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      
      // Execute
      fixture.detectChanges();
      
      // Assert
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      expect(deleteButton).toBeTruthy();
      expect(deleteButton.nativeElement.textContent).toContain('Detail');
    });

    it('should not display delete account button for admin users', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockAdminUser));
      
      // Execute
      fixture.detectChanges();
      
      // Assert
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      expect(deleteButton).toBeFalsy();
    });

    it('should display creation and update dates', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      
      // Execute
      fixture.detectChanges();
      
      // Assert
      const dateElements = fixture.debugElement.queryAll(By.css('.p2 p'));
      expect(dateElements.length).toBe(2);
      expect(dateElements[0].nativeElement.textContent).toContain('Create at:');
      expect(dateElements[1].nativeElement.textContent).toContain('Last update:');
    });

    it('should not display user information when user data fails to load', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(
        throwError(() => new Error('Failed to load user'))
      );
      
      // Execute
      fixture.detectChanges();
      
      // Assert
      const userInfoDiv = fixture.debugElement.query(By.css('div[fxLayout="column"][fxLayoutAlign="start center"]'));
      expect(userInfoDiv).toBeFalsy();
    });
  });

  describe('Back Navigation', () => {
    it('should have a back button', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      
      // Execute
      fixture.detectChanges();
      
      // Assert
      const backButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      expect(backButton).toBeTruthy();
      
      const backIcon = backButton.query(By.css('mat-icon'));
      expect(backIcon.nativeElement.textContent).toContain('arrow_back');
    });

    it('should call back() method when back button is clicked', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      const backSpy = jest.spyOn(component, 'back');
      const windowSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
      
      // Execute
      fixture.detectChanges();
      const backButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      backButton.triggerEventHandler('click', null);
      
      // Assert
      expect(backSpy).toHaveBeenCalled();
      expect(windowSpy).toHaveBeenCalled();
      
      // Cleanup
      windowSpy.mockRestore();
    });
  });

  describe('Delete Account', () => {
    it('should call delete() method when delete button is clicked', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      jest.spyOn(userService, 'delete').mockReturnValue(of({}));
      const deleteSpy = jest.spyOn(component, 'delete');
      
      // Execute
      fixture.detectChanges();
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      deleteButton.triggerEventHandler('click', null);
      
      // Assert
      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should show snackbar, log out user and navigate to home on successful delete', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      jest.spyOn(userService, 'delete').mockReturnValue(of({}));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');
      const logOutSpy = jest.spyOn(sessionService, 'logOut');
      const navigateSpy = jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      
      // Execute
      fixture.detectChanges();
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      deleteButton.triggerEventHandler('click', null);
      
      // Assert
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Your account has been deleted !', 
        'Close', 
        { duration: 3000 }
      );
      expect(logOutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should handle error when delete fails', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      jest.spyOn(userService, 'delete').mockReturnValue(
        throwError(() => new Error('Failed to delete user'))
      );
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');
      const logOutSpy = jest.spyOn(sessionService, 'logOut');
      const navigateSpy = jest.spyOn(router, 'navigate');
      
      // Execute
      fixture.detectChanges();
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      deleteButton.triggerEventHandler('click', null);
      
      // Assert
      expect(snackBarSpy).not.toHaveBeenCalled();
      expect(logOutSpy).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('End-to-End User Flow', () => {
    it('should perform the complete user account deletion flow', () => {
      // Setup
      jest.spyOn(userService, 'getById').mockReturnValue(of(mockUser));
      jest.spyOn(userService, 'delete').mockReturnValue(of({}));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');
      const logOutSpy = jest.spyOn(sessionService, 'logOut');
      const navigateSpy = jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      
      // Execute - load component
      fixture.detectChanges();
      
      // Verify user data is displayed
      const nameElement = fixture.debugElement.query(By.css('p')).nativeElement;
      expect(nameElement.textContent).toContain('Test USER');
      
      // Click delete button
      const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
      deleteButton.nativeElement.click();
      
      // Assert complete flow
      expect(userService.delete).toHaveBeenCalledWith('1');
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Your account has been deleted !', 
        'Close', 
        { duration: 3000 }
      );
      expect(logOutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
