/**
 * E2E tests for EmployeesController
 *
 * Note: TypeScript strict mode is disabled for `any` types in this file because
 * supertest's response.body is intentionally untyped. Type assertions would add
 * significant verbosity without meaningful safety gains in integration tests.
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import request from 'supertest';

describe('EmployeesController (e2e)', () => {
  let app: INestApplication<App>;
  let createdEmployeeId: string;
  let rootEmployeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar as mesmas configurações do main.ts
    app.setGlobalPrefix('api', {
      exclude: ['/', 'health'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== GET ====================

  describe('GET /api/employees', () => {
    it('should return array of employees', () => {
      return request(app.getHttpServer())
        .get('/api/employees')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('title');
        });
    });

    it('should search employees by name', () => {
      return request(app.getHttpServer())
        .get('/api/employees?search=a')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((emp: { name: string }) => {
            expect(emp.name.toLowerCase()).toContain('a');
          });
        });
    });

    it('should return empty array for non-matching search', () => {
      return request(app.getHttpServer())
        .get('/api/employees?search=XYZNONEXISTENT')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('GET /api/employees/hierarchy', () => {
    it('should return hierarchical tree structure', () => {
      return request(app.getHttpServer())
        .get('/api/employees/hierarchy')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          // Root employees should not have reports_to_id
          res.body.forEach(
            (emp: { reports_to_id: null; subordinates: unknown[] }) => {
              expect(emp.reports_to_id).toBeNull();
              expect(emp).toHaveProperty('subordinates');
              expect(Array.isArray(emp.subordinates)).toBe(true);
            },
          );
        });
    });
  });

  describe('GET /api/employees/roots', () => {
    it('should return only root employees', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/employees/roots')
        .expect(200);

      const employees = response.body as Array<{
        id: string;
        reports_to_id: null;
      }>;

      expect(Array.isArray(employees)).toBe(true);
      expect(employees.length).toBeGreaterThan(0);

      // Save a root employee ID for later tests
      rootEmployeeId = employees[0].id;

      employees.forEach((emp) => {
        expect(emp.reports_to_id).toBeNull();
      });
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should return employee by ID', async () => {
      // First get an employee ID
      const listResponse = await request(app.getHttpServer()).get(
        '/api/employees',
      );
      const employeeId = listResponse.body[0].id;

      return request(app.getHttpServer())
        .get(`/api/employees/${employeeId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', employeeId);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('title');
        });
    });

    it('should return 404 for non-existent ID', () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/api/employees/${fakeUuid}`)
        .expect(404);
    });

    it('should return 404 for invalid UUID format', () => {
      return request(app.getHttpServer())
        .get('/api/employees/invalid-uuid')
        .expect(404);
    });
  });

  // ==================== POST ====================

  describe('POST /api/employees', () => {
    it('should create a new employee', async () => {
      const newEmployee = {
        name: 'Test Employee E2E',
        title: 'QA Engineer',
        reports_to_id: rootEmployeeId,
        profile_image_url: 'img/test.png',
        timezone: 'America/Sao_Paulo',
      };

      const response = await request(app.getHttpServer())
        .post('/api/employees')
        .send(newEmployee)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newEmployee.name);
      expect(response.body.title).toBe(newEmployee.title);

      // Save ID for later tests
      createdEmployeeId = response.body.id;
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({
          // Missing required fields
          name: '',
        })
        .expect(400);
    });

    it('should fail with extra fields', () => {
      return request(app.getHttpServer())
        .post('/api/employees')
        .send({
          name: 'Test',
          title: 'Developer',
          extraField: 'not allowed',
        })
        .expect(400);
    });
  });

  describe('POST /api/employees/bulk', () => {
    it('should create multiple employees', () => {
      const employees = [
        {
          name: 'Bulk Test 1',
          title: 'Developer 1',
          reports_to_id: null,
          profile_image_url: 'img/bulk1.png',
          timezone: 'America/New_York',
        },
        {
          name: 'Bulk Test 2',
          title: 'Developer 2',
          reports_to_id: null,
          profile_image_url: 'img/bulk2.png',
          timezone: 'Europe/London',
        },
      ];

      return request(app.getHttpServer())
        .post('/api/employees/bulk')
        .send(employees)
        .expect(201)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[1]).toHaveProperty('id');
        });
    });

    it('should fail with invalid bulk data', () => {
      // Note: ValidationPipe doesn't validate arrays automatically,
      // so invalid data reaches the database and returns 500
      return request(app.getHttpServer())
        .post('/api/employees/bulk')
        .send([{ invalid: 'data' }])
        .expect(500);
    });
  });

  // ==================== PUT ====================

  describe('PUT /api/employees/:id', () => {
    it('should update employee', async () => {
      const updateData = {
        name: 'Updated Test Employee',
        title: 'Senior QA Engineer',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/employees/${createdEmployeeId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.title).toBe(updateData.title);
    });

    it('should return 404 for non-existent employee', () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .put(`/api/employees/${fakeUuid}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('PUT /api/employees/:id/hierarchy', () => {
    it('should update employee hierarchy', () => {
      return request(app.getHttpServer())
        .put(`/api/employees/${createdEmployeeId}/hierarchy`)
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body.reports_to_id).toBeNull();
        });
    });

    it('should prevent circular hierarchy', async () => {
      // Get two employees with hierarchy relationship
      const rootsResponse = await request(app.getHttpServer()).get(
        '/api/employees/roots',
      );
      const rootId = rootsResponse.body[0].id;

      // Try to make root report to a subordinate (would create cycle)
      return request(app.getHttpServer())
        .put(`/api/employees/${rootId}/hierarchy`)
        .send({ new_manager_id: createdEmployeeId })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('ciclo');
        });
    });

    it('should return 404 for non-existent employee', () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .put(`/api/employees/${fakeUuid}/hierarchy`)
        .send({})
        .expect(404);
    });
  });

  // ==================== DELETE ====================

  describe('DELETE /api/employees/:id', () => {
    it('should fail to delete employee with subordinates', async () => {
      // Root employees likely have subordinates
      return request(app.getHttpServer())
        .delete(`/api/employees/${rootEmployeeId}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('subordinados');
        });
    });

    it('should delete employee without subordinates', () => {
      return request(app.getHttpServer())
        .delete(`/api/employees/${createdEmployeeId}`)
        .expect(204);
    });

    it('should confirm employee was deleted', () => {
      return request(app.getHttpServer())
        .get(`/api/employees/${createdEmployeeId}`)
        .expect(404);
    });

    it('should return 404 for non-existent employee', () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .delete(`/api/employees/${fakeUuid}`)
        .expect(404);
    });
  });

  // ==================== Integration Tests ====================

  describe('Integration: Complete CRUD flow', () => {
    let tempEmployeeId: string;

    it('should create → read → update → delete employee', async () => {
      // 1. CREATE
      const createResponse = await request(app.getHttpServer())
        .post('/api/employees')
        .send({
          name: 'Integration Test',
          title: 'Test Engineer',
          reports_to_id: null,
          profile_image_url: 'img/integration.png',
          timezone: 'UTC',
        })
        .expect(201);

      tempEmployeeId = createResponse.body.id;
      expect(tempEmployeeId).toBeDefined();

      // 2. READ
      const readResponse = await request(app.getHttpServer())
        .get(`/api/employees/${tempEmployeeId}`)
        .expect(200);

      expect(readResponse.body.name).toBe('Integration Test');

      // 3. UPDATE
      const updateResponse = await request(app.getHttpServer())
        .put(`/api/employees/${tempEmployeeId}`)
        .send({ title: 'Senior Test Engineer' })
        .expect(200);

      expect(updateResponse.body.title).toBe('Senior Test Engineer');

      // 4. DELETE
      await request(app.getHttpServer())
        .delete(`/api/employees/${tempEmployeeId}`)
        .expect(204);

      // 5. VERIFY DELETION
      await request(app.getHttpServer())
        .get(`/api/employees/${tempEmployeeId}`)
        .expect(404);
    });
  });
});
