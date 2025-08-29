import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should return all teachers', () => {
      const mockTeachers: Teacher[] = [
        { 
          id: 1, 
          lastName: 'Smith',
          firstName: 'John',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          id: 2, 
          lastName: 'Doe',
          firstName: 'Jane',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.all().subscribe(teachers => {
        expect(teachers).toEqual(mockTeachers);
        expect(teachers.length).toBe(2);
      });

      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    it('should handle errors when all() fails', () => {
      const mockError = { status: 500, statusText: 'Server Error' };

      service.all().subscribe({
        next: () => fail('Expected an error, not teachers'),
        error: error => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('api/teacher');
      req.flush('Server error', mockError);
    });
  });

  describe('detail', () => {
    it('should return a teacher when detail is called with a valid ID', () => {
      const mockId = '123';
      const mockTeacher: Teacher = { 
        id: 123, 
        lastName: 'Smith',
        firstName: 'John',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.detail(mockId).subscribe(teacher => {
        expect(teacher).toEqual(mockTeacher);
      });

      const req = httpMock.expectOne(`api/teacher/${mockId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });

    it('should handle errors when detail fails', () => {
      const mockId = '456';
      const mockError = { status: 404, statusText: 'Not Found' };

      service.detail(mockId).subscribe({
        next: () => fail('Expected an error, not a teacher'),
        error: error => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`api/teacher/${mockId}`);
      req.flush('Teacher not found', mockError);
    });
  });
});
