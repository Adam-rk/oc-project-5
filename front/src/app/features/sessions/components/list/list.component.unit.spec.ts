import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';

import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  const mockSessionInformation: SessionInformation = {
    token: 'mock-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: true
  };

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga Session 1',
      description: 'Beginner friendly yoga session',
      date: new Date('2025-09-01'),
      teacher_id: 1,
      users: [1, 2, 3],
      createdAt: new Date('2025-08-01'),
      updatedAt: new Date('2025-08-10')
    },
    {
      id: 2,
      name: 'Meditation Session',
      description: 'Advanced meditation techniques',
      date: new Date('2025-09-15'),
      teacher_id: 2,
      users: [1, 4],
      createdAt: new Date('2025-08-05'),
      updatedAt: new Date('2025-08-10')
    }
  ];

  const mockSessionService = {
    sessionInformation: mockSessionInformation,
    logOut: jest.fn()
  };

  const mockSessionApiService = {
    all: jest.fn().mockReturnValue(of(mockSessions))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [HttpClientModule, MatCardModule, MatIconModule, RouterTestingModule, RouterModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize sessions$ observable on creation', () => {
      // Verify the sessions$ observable was initialized with the result from sessionApiService.all()
      expect(mockSessionApiService.all).toHaveBeenCalled();
      
      // Subscribe to the sessions$ observable and verify it emits the mock sessions
      component.sessions$.subscribe(sessions => {
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(2);
      });
    });
  });

  describe('User Getter', () => {
    it('should return the session information from SessionService', () => {
      // Test the user getter
      expect(component.user).toBe(mockSessionInformation);
      expect(component.user?.admin).toBe(true);
      expect(component.user?.firstName).toBe('Test');
    });

    it('should handle undefined session information', () => {
      // Modify the mock to return undefined
      const originalSessionInfo = mockSessionService.sessionInformation;
      (mockSessionService as any).sessionInformation = undefined;
      
      // Verify the getter returns undefined
      expect(component.user).toBeUndefined();
      
      // Restore the original mock
      mockSessionService.sessionInformation = originalSessionInfo;
    });
  });

  describe('Sessions Observable', () => {
    it('should fetch sessions from SessionApiService', () => {
      expect(mockSessionApiService.all).toHaveBeenCalled();
    });
    
    it('should contain the correct session data', (done) => {
      component.sessions$.subscribe(sessions => {
        // Check first session
        expect(sessions[0].id).toBe(1);
        expect(sessions[0].name).toBe('Yoga Session 1');
        expect(sessions[0].description).toBe('Beginner friendly yoga session');
        
        // Check second session
        expect(sessions[1].id).toBe(2);
        expect(sessions[1].name).toBe('Meditation Session');
        
        done();
      });
    });
  });
});
