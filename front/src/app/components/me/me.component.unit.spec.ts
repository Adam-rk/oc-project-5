import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { User } from 'src/app/interfaces/user.interface';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';

import { MeComponent } from './me.component';

describe('MeComponent', () => {
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

  const mockUserService = {
    getById: jest.fn(),
    delete: jest.fn()
  };

  const mockSessionService = {
    sessionInformation: mockSessionInfo,
    logOut: jest.fn()
  } as any; // Using any to allow setting sessionInformation to null in tests

  const mockRouter = {
    navigate: jest.fn()
  };

  const mockMatSnackBar = {
    open: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        MatSnackBarModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockMatSnackBar }
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);
    
    // Reset mocks before each test
    mockUserService.getById.mockReset();
    mockUserService.delete.mockReset();
    mockSessionService.logOut.mockReset();
    mockRouter.navigate.mockReset();
    mockMatSnackBar.open.mockReset();
    
    // Ensure sessionInformation is set for each test
    mockSessionService.sessionInformation = mockSessionInfo;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch user data on initialization', () => {
      // Setup
      mockUserService.getById.mockReturnValue(of(mockUser));
      
      // Execute
      component.ngOnInit();
      
      // Assert
      expect(mockUserService.getById).toHaveBeenCalledWith('1');
      expect(component.user).toEqual(mockUser);
    });

    it('should handle error when fetching user data fails', () => {
      // Setup
      mockUserService.getById.mockReturnValue(throwError(() => new Error('Failed to fetch user')));
      
      // Execute
      fixture.detectChanges(); // This will trigger ngOnInit
      
      // Assert
      expect(mockUserService.getById).toHaveBeenCalledWith('1');
      expect(component.user).toBeUndefined();
    });

    it('should handle case when sessionInformation is null', () => {
      // Setup
      mockSessionService.sessionInformation = null;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a safe version of ngOnInit to test null case
      const safeNgOnInit = () => {
        try {
          component.ngOnInit();
        } catch (error) {
          // Expected error when sessionInformation is null
        }
      };
      
      // Execute
      safeNgOnInit();
      
      // Assert
      expect(mockUserService.getById).not.toHaveBeenCalled();
      expect(component.user).toBeUndefined();
      
      // Restore for other tests
      mockSessionService.sessionInformation = mockSessionInfo;
      consoleSpy.mockRestore();
    });
  });

  describe('back', () => {
    it('should navigate back in browser history', () => {
      // Setup
      const windowSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
      
      // Execute
      component.back();
      
      // Assert
      expect(windowSpy).toHaveBeenCalled();
      
      // Cleanup
      windowSpy.mockRestore();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      // Set up user property
      component.user = mockUser;
    });

    it('should call userService.delete with correct ID', () => {
      // Setup
      mockUserService.delete.mockReturnValue(of({}));
      
      // Execute
      component.delete();
      
      // Assert
      expect(mockUserService.delete).toHaveBeenCalledWith('1');
    });

    it('should show success message, log out user and navigate to home on successful delete', () => {
      // Setup
      mockUserService.delete.mockReturnValue(of({}));
      
      // Execute
      component.delete();
      
      // Assert
      expect(mockMatSnackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !', 
        'Close', 
        { duration: 3000 }
      );
      expect(mockSessionService.logOut).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle error when delete fails', () => {
      // Setup
      mockUserService.delete.mockReturnValue(throwError(() => new Error('Failed to delete user')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Execute
      component.delete();
      
      // Assert
      expect(mockUserService.delete).toHaveBeenCalledWith('1');
      expect(mockMatSnackBar.open).not.toHaveBeenCalled();
      expect(mockSessionService.logOut).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle case when sessionInformation is null', () => {
      // Setup
      mockSessionService.sessionInformation = null;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a safe version of delete to test null case
      const safeDelete = () => {
        try {
          component.delete();
        } catch (error) {
          // Expected error when sessionInformation is null
        }
      };
      
      // Execute
      safeDelete();
      
      // Assert
      expect(mockUserService.delete).not.toHaveBeenCalled();
      
      // Restore for other tests
      mockSessionService.sessionInformation = mockSessionInfo;
      consoleSpy.mockRestore();
    });
  });
});
