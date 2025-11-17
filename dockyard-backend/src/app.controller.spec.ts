import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Employee } from './employees/employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AppController', () => {
  let appController: AppController;

  const mockEmployeeRepository = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /', () => {
    it('should return API info', () => {
      const result = appController.getRoot();
      expect(result).toEqual({
        message: 'Dockyard API',
        version: '1.0.0',
        documentation: '/api',
        health: '/health',
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status with ok database', async () => {
      mockEmployeeRepository.query.mockResolvedValue([{ 1: 1 }]);

      const result = await appController.getHealth();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('Dockyard API');
      expect(result.checks.database).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return health status with error database', async () => {
      mockEmployeeRepository.query.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await appController.getHealth();

      expect(result.status).toBe('error');
      expect(result.checks.database).toBe('error');
    });
  });
});
