import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employee } from './employees/employee.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  getRoot() {
    return {
      message: 'Dockyard API',
      version: '1.0.0',
      documentation: '/api',
      health: '/health',
    };
  }

  async getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'Dockyard API',
      version: '1.0.0',
      checks: {
        database: 'ok',
      },
    };

    try {
      // Testa conexão com o banco fazendo uma query simples
      await this.employeeRepository.query('SELECT 1');
    } catch {
      health.status = 'error';
      health.checks.database = 'error';
    }

    return health;
  }
}
