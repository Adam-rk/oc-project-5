import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { expect } from '@jest/globals';

import { DetailComponent } from './detail.component';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  
  // Mock services
  let mockSessionService: any;
  let mockSessionApiService: any;
  let mockTeacherService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockMatSnackBar: any;
  let mockFormBuilder: any;
  
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
    users: [1, 2, 3]
  };
  
  const mockSessionWithoutUser: Session = {
    ...mockSession,
    users: [1, 3]
  };
  
  const mockTeacher: Teacher = {
    id: 3,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  beforeEach(() => {
    // Initialize mocks
    mockSessionService = {
      sessionInformation: mockSessionInformation
    };
    
    mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      delete: jest.fn().mockReturnValue(of({})),
      participate: jest.fn().mockReturnValue(of({})),
      unParticipate: jest.fn().mockReturnValue(of({}))
    };
    
    mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(mockTeacher))
    };
    
    mockRouter = {
      navigate: jest.fn()
    };
    
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(mockSessionId)
        }
      }
    };
    
    mockMatSnackBar = {
      open: jest.fn()
    };
    
    mockFormBuilder = {};
    
    TestBed.configureTestingModule({
      declarations: [DetailComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: FormBuilder, useValue: mockFormBuilder }
      ]
    });
    
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  describe('Initialization', () => {
    it('should initialize component properties from route and session service', () => {
      // Component properties are initialized in constructor
      expect(component.sessionId).toBe(mockSessionId);
      expect(component.isAdmin).toBe(mockSessionInformation.admin);
      expect(component.userId).toBe(mockSessionInformation.id.toString());
    });
    
    it('should fetch session details on init', () => {
      // Call ngOnInit to trigger fetchSession
      component.ngOnInit();
      
      // Verify API calls
      expect(mockSessionApiService.detail).toHaveBeenCalledWith(mockSessionId);
      expect(mockTeacherService.detail).toHaveBeenCalledWith(mockSession.teacher_id.toString());
      
      // Verify data is set correctly
      expect(component.session).toEqual(mockSession);
      expect(component.teacher).toEqual(mockTeacher);
      expect(component.isParticipate).toBe(true); // User ID 2 is in the session users array
    });
    
    it('should set isParticipate to false when user is not in session', () => {
      // Override the session detail response
      mockSessionApiService.detail.mockReturnValue(of(mockSessionWithoutUser));
      
      component.ngOnInit();
      
      expect(component.isParticipate).toBe(false);
    });
    
    it('should set isAdmin correctly for admin user', () => {
      // Set admin user
      mockSessionService.sessionInformation = mockAdminSessionInformation;
      
      // Re-create component to use updated session service
      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      
      expect(component.isAdmin).toBe(true);
    });
  });
  
  describe('Navigation', () => {
    it('should call window.history.back when back method is called', () => {
      // Spy on window.history.back
      const historySpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
      
      component.back();
      
      expect(historySpy).toHaveBeenCalled();
      
      // Restore original implementation
      historySpy.mockRestore();
    });
  });
  
  describe('Session deletion', () => {
    it('should call delete API and navigate to sessions page on success', () => {
      component.delete();
      
      expect(mockSessionApiService.delete).toHaveBeenCalledWith(mockSessionId);
      expect(mockMatSnackBar.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });
  
  describe('Participation', () => {
    it('should call participate API and refresh session data', () => {
      // Spy on fetchSession
      const fetchSessionSpy = jest.spyOn(component as any, 'fetchSession');
      
      component.participate();
      
      expect(mockSessionApiService.participate).toHaveBeenCalledWith(mockSessionId, mockUserId);
      expect(fetchSessionSpy).toHaveBeenCalled();
    });
    
    it('should call unParticipate API and refresh session data', () => {
      // Spy on fetchSession
      const fetchSessionSpy = jest.spyOn(component as any, 'fetchSession');
      
      component.unParticipate();
      
      expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith(mockSessionId, mockUserId);
      expect(fetchSessionSpy).toHaveBeenCalled();
    });
  });
  
  describe('Session fetching', () => {
    it('should update component properties when fetchSession is called', () => {
      // Call the private method directly
      (component as any).fetchSession();
      
      expect(mockSessionApiService.detail).toHaveBeenCalledWith(mockSessionId);
      expect(mockTeacherService.detail).toHaveBeenCalledWith(mockSession.teacher_id.toString());
      
      expect(component.session).toEqual(mockSession);
      expect(component.teacher).toEqual(mockTeacher);
    });
  });
});
