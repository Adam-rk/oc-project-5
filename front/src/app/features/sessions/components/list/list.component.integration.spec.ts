import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ListComponent } from './list.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { SessionInformation } from '../../../../interfaces/sessionInformation.interface';

describe('ListComponent Integration Tests', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;

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

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga Session 1',
      description: 'Yoga Session 1',
      date: new Date('2025-09-01'),
      teacher_id: 1,
      users: [1, 2, 3],
      createdAt: new Date('2025-08-01'),
      updatedAt: new Date('2025-08-10')
    },
    {
      id: 2,
      name: 'Meditation Session',
      description: 'Meditation Session',
      date: new Date('2025-09-15'),
      teacher_id: 2,
      users: [1, 4],
      createdAt: new Date('2025-08-05'),
      updatedAt: new Date('2025-08-10')
    }
  ];

  function setupComponent(isAdmin: boolean = false) {
    TestBed.overrideProvider(SessionService, {
      useValue: {
        sessionInformation: isAdmin ? mockAdminSessionInformation : mockSessionInformation
      }
    });

    TestBed.overrideProvider(SessionApiService, {
      useValue: {
        all: jest.fn().mockReturnValue(of(mockSessions))
      }
    });

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        FlexLayoutModule
      ],
      providers: [
        SessionService,
        SessionApiService
      ],
      schemas: [NO_ERRORS_SCHEMA] // To handle fxLayout directives
    }).compileComponents();
  });

  it('should create', () => {
    setupComponent();
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should display the title "Rentals available"', () => {
      setupComponent();
      const titleElement = fixture.debugElement.query(By.css('mat-card-title')).nativeElement;
      expect(titleElement.textContent).toContain('Rentals available');
    });

    it('should display the main container with proper layout', () => {
      setupComponent();
      const listContainer = fixture.debugElement.query(By.css('.list'));
      expect(listContainer).toBeTruthy();
      
      const matCard = fixture.debugElement.query(By.css('mat-card'));
      expect(matCard).toBeTruthy();
    });
  });

  describe('Admin vs Non-Admin UI', () => {
    it('should not show create button for non-admin users', () => {
      setupComponent(false);
      const createButton = fixture.debugElement.query(By.css('button[routerLink="create"]'));
      expect(createButton).toBeFalsy();
    });

    it('should show create button for admin users', () => {
      setupComponent(true);
      const createButton = fixture.debugElement.query(By.css('button[routerLink="create"]'));
      expect(createButton).toBeTruthy();
      expect(createButton.nativeElement.textContent).toContain('Create');
    });

    it('should not show edit buttons for non-admin users', () => {
      setupComponent(false);
      fixture.detectChanges();
      const editButtons = fixture.debugElement.queryAll(By.css('button[routerLink^="[\'update\'"]'));
      expect(editButtons.length).toBe(0);
    });

    it('should show edit buttons for admin users', () => {
      setupComponent(true);
      const editButtons = fixture.debugElement.queryAll(By.css('mat-card-actions button:nth-child(2)'));
      expect(editButtons.length).toBe(mockSessions.length);
      editButtons.forEach(button => {
        expect(button.nativeElement.textContent).toContain('Edit');
      });
    });
  });

  describe('Session List Rendering', () => {
    it('should display the correct number of session cards', () => {
      setupComponent();
      const sessionCards = fixture.debugElement.queryAll(By.css('.items mat-card'));
      expect(sessionCards.length).toBe(mockSessions.length);
    });

    it('should display session names correctly', () => {
      setupComponent();
      const sessionTitles = fixture.debugElement.queryAll(By.css('.items mat-card-title'));
      expect(sessionTitles.length).toBe(mockSessions.length);
      expect(sessionTitles[0].nativeElement.textContent).toContain('Yoga Session 1');
      expect(sessionTitles[1].nativeElement.textContent).toContain('Meditation Session');
    });

    it('should display session dates correctly', () => {
      setupComponent();
      const sessionDates = fixture.debugElement.queryAll(By.css('.items mat-card-subtitle'));
      expect(sessionDates.length).toBe(mockSessions.length);
      expect(sessionDates[0].nativeElement.textContent).toContain('Session on');
    });

    it('should display session descriptions correctly', () => {
      setupComponent();
      const sessionDescriptions = fixture.debugElement.queryAll(By.css('.items mat-card-content p'));
      expect(sessionDescriptions.length).toBe(mockSessions.length);
      expect(sessionDescriptions[0].nativeElement.textContent).toContain('Yoga Session 1');
      expect(sessionDescriptions[1].nativeElement.textContent).toContain('Meditation Session');
    });

    it('should display detail buttons for all sessions', () => {
      setupComponent();
      const detailButtons = fixture.debugElement.queryAll(By.css('.items mat-card-actions button:first-child'));
      expect(detailButtons.length).toBe(mockSessions.length);
      detailButtons.forEach(button => {
        expect(button.nativeElement.textContent).toContain('Detail');
      });
    });

    it('should display yoga session images', () => {
      setupComponent();
      const images = fixture.debugElement.queryAll(By.css('.items img.picture'));
      expect(images.length).toBe(mockSessions.length);
      images.forEach(img => {
        expect(img.nativeElement.getAttribute('src')).toBe('assets/sessions.png');
        expect(img.nativeElement.getAttribute('alt')).toBe('Yoga session');
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have correct detail links with session ids', () => {
      setupComponent();
      const detailButtons = fixture.debugElement.queryAll(By.css('.items mat-card-actions button:first-child'));
      expect(detailButtons[0].attributes['ng-reflect-router-link']).toContain('detail,1');
      expect(detailButtons[1].attributes['ng-reflect-router-link']).toContain('detail,2');
    });

    it('should have correct edit links with session ids for admin users', () => {
      setupComponent(true);
      const editButtons = fixture.debugElement.queryAll(By.css('.items mat-card-actions button:nth-child(2)'));
      expect(editButtons[0].attributes['ng-reflect-router-link']).toContain('update,1');
      expect(editButtons[1].attributes['ng-reflect-router-link']).toContain('update,2');
    });
  });
});
