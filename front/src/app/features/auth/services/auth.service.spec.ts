import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { AuthService } from './auth.service';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should send a POST request with register data', () => {
      const mockRegisterRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      service.register(mockRegisterRequest).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);
      req.flush(null);
    });

    it('should handle errors when register fails', () => {
      const mockRegisterRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };
      const mockError = { status: 400, statusText: 'Bad Request' };

      service.register(mockRegisterRequest).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: error => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('api/auth/register');
      req.flush('Invalid registration data', mockError);
    });
  });

  describe('login', () => {
    it('should send a POST request with login credentials and return session information', () => {
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockSessionInfo: SessionInformation = {
        token: 'mock-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };

      service.login(mockLoginRequest).subscribe(response => {
        expect(response).toEqual(mockSessionInfo);
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      req.flush(mockSessionInfo);
    });

    it('should handle errors when login fails', () => {
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrong-password'
      };
      const mockError = { status: 401, statusText: 'Unauthorized' };

      service.login(mockLoginRequest).subscribe({
        next: () => fail('Expected an error, not session information'),
        error: error => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('api/auth/login');
      req.flush('Invalid credentials', mockError);
    });
  });
});
