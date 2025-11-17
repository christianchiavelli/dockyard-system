import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Employee } from './employee.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateHierarchyDto,
} from './employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  // Buscar todos os funcionários
  async findAll(): Promise<Employee[]> {
    return this.employeesRepository.find({
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  // Buscar funcionários raiz (sem gerente)
  async findRoots(): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { reports_to_id: IsNull() },
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  // Buscar hierarquia completa em árvore
  async findHierarchy(): Promise<Employee[]> {
    const roots = await this.findRoots();
    return Promise.all(roots.map((root) => this.buildTree(root)));
  }

  // Construir árvore recursivamente
  private async buildTree(employee: Employee): Promise<Employee> {
    const subordinates = await this.employeesRepository.find({
      where: { reports_to_id: employee.id },
      order: { display_order: 'ASC', name: 'ASC' },
    });

    employee.subordinates = await Promise.all(
      subordinates.map((sub) => this.buildTree(sub)),
    );

    return employee;
  }

  // Buscar por ID
  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['manager', 'subordinates'],
    });

    if (!employee) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
    }

    return employee;
  }

  // Buscar por nome
  async search(name: string): Promise<Employee[]> {
    return this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.name LIKE :name', { name: `%${name}%` })
      .orderBy('employee.name', 'ASC')
      .getMany();
  }

  // Criar funcionário
  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeesRepository.create(createEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  // Criar múltiplos funcionários (para seed)
  async createBulk(employees: CreateEmployeeDto[]): Promise<Employee[]> {
    const entities = this.employeesRepository.create(employees);
    return this.employeesRepository.save(entities);
  }

  // Atualizar funcionário
  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  // Atualizar hierarquia (drag and drop)
  async updateHierarchy(
    id: string,
    updateHierarchyDto: UpdateHierarchyDto,
  ): Promise<Employee> {
    const { new_manager_id } = updateHierarchyDto;

    console.log('🔄 UPDATE HIERARCHY:', {
      employeeId: id,
      newManagerId: new_manager_id,
    });

    // Validar que o funcionário existe
    const employee = await this.findOne(id);
    console.log('📋 Employee before update:', {
      id: employee.id,
      name: employee.name,
      oldManager: employee.reports_to_id,
    });

    // Se tem novo gerente, validar que ele existe
    if (new_manager_id) {
      await this.findOne(new_manager_id);

      // Validar que não está criando ciclo
      if (await this.wouldCreateCycle(id, new_manager_id)) {
        throw new BadRequestException(
          'Não é possível criar ciclo na hierarquia: funcionário não pode reportar a um subordinado',
        );
      }
    }

    // Atualizar hierarquia usando update direto (save não funciona com relações carregadas)
    await this.employeesRepository.update(id, {
      reports_to_id: new_manager_id || null,
    });

    // Buscar o employee atualizado
    const updated = await this.findOne(id);

    console.log('✅ Employee after update:', {
      id: updated.id,
      name: updated.name,
      newManager: updated.reports_to_id,
    });

    return updated;
  }

  // Verificar se criaria ciclo na hierarquia
  private async wouldCreateCycle(
    employeeId: string,
    newManagerId: string,
  ): Promise<boolean> {
    let currentId = newManagerId;

    while (currentId) {
      if (currentId === employeeId) {
        return true; // Ciclo detectado
      }

      const current = await this.employeesRepository.findOne({
        where: { id: currentId },
      });

      if (!current || !current.reports_to_id) {
        break;
      }

      currentId = current.reports_to_id;
    }

    return false;
  }

  // Deletar funcionário
  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);

    // Verificar se tem subordinados
    const subordinatesCount = await this.employeesRepository.count({
      where: { reports_to_id: id },
    });

    if (subordinatesCount > 0) {
      throw new BadRequestException(
        'Não é possível deletar funcionário com subordinados. Reatribua-os primeiro.',
      );
    }

    await this.employeesRepository.remove(employee);
  }

  // Limpar todos os dados
  async clear(): Promise<void> {
    await this.employeesRepository.clear();
  }
}
