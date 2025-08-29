import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should return a user when getById is called with a valid ID', () => {
      const mockId = '123';
      const mockUser: User = { 
        id: 123, 
        email: 'test@example.com',
        lastName: 'User',
        firstName: 'Test',
        admin: false,
        password: 'password123',
        createdAt: new Date()
      };

      service.getById(mockId).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`api/user/${mockId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle errors when getById fails', () => {
      const mockId = '456';
      const mockError = { status: 404, statusText: 'Not Found' };

      service.getById(mockId).subscribe({
        next: () => fail('Expected an error, not a user'),
        error: error => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`api/user/${mockId}`);
      req.flush('User not found', mockError);
    });
  });

  describe('delete', () => {
    it('should delete a user when delete is called with a valid ID', () => {
      const mockId = '123';
      const mockResponse = { message: 'User deleted successfully' };

      service.delete(mockId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`api/user/${mockId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle errors when delete fails', () => {
      const mockId = '456';
      const mockError = { status: 500, statusText: 'Server Error' };

      service.delete(mockId).subscribe({
        next: () => fail('Expected an error, not a success response'),
        error: error => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`api/user/${mockId}`);
      req.flush('Server error', mockError);
    });
  });
});
