import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;
  let mockSessionInfo: SessionInformation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
    
    // Create mock session information for testing
    mockSessionInfo = {
      token: 'mock-jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('Initial state', () => {
    it('should initialize with isLogged as false', () => {
      expect(service.isLogged).toBe(false);
    });
    
    it('should initialize with undefined sessionInformation', () => {
      expect(service.sessionInformation).toBeUndefined();
    });
    
    it('should emit false from $isLogged initially', (done) => {
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(false);
        done();
      });
    });
  });
  
  describe('logIn', () => {
    it('should set isLogged to true when logging in', () => {
      service.logIn(mockSessionInfo);
      expect(service.isLogged).toBe(true);
    });
    
    it('should store session information when logging in', () => {
      service.logIn(mockSessionInfo);
      expect(service.sessionInformation).toEqual(mockSessionInfo);
    });
    
    it('should emit true from $isLogged after login', (done) => {
      service.logIn(mockSessionInfo);
      
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(true);
        done();
      });
    });
  });
  
  describe('logOut', () => {
    beforeEach(() => {
      // Set up logged in state before testing logout
      service.logIn(mockSessionInfo);
    });
    
    it('should set isLogged to false when logging out', () => {
      service.logOut();
      expect(service.isLogged).toBe(false);
    });
    
    it('should clear session information when logging out', () => {
      service.logOut();
      expect(service.sessionInformation).toBeUndefined();
    });
    
    it('should emit false from $isLogged after logout', (done) => {
      service.logOut();
      
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(false);
        done();
      });
    });
  });
  
  describe('Observable behavior', () => {
    it('should emit updated login status to all subscribers', (done) => {
      let emissionCount = 0;
      const expectedValues = [false, true, false]; // Initial, login, logout
      
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(expectedValues[emissionCount]);
        emissionCount++;
        
        if (emissionCount === expectedValues.length) {
          done();
        }
      });
      
      // Trigger state changes
      service.logIn(mockSessionInfo);
      service.logOut();
    });
  });
});
