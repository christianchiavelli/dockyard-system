import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateHierarchyDto,
} from './employee.dto';
import { Employee } from './employee.entity';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // ==================== GET ====================

  @Get()
  @ApiOperation({ summary: 'Listar todos os funcionários ou buscar por nome' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar funcionários por nome',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de funcionários retornada com sucesso',
  })
  async findAll(@Query('search') search?: string): Promise<Employee[]> {
    if (search) {
      return this.employeesService.search(search);
    }
    return this.employeesService.findAll();
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Obter hierarquia completa em árvore' })
  @ApiResponse({
    status: 200,
    description: 'Hierarquia de funcionários retornada com sucesso',
  })
  async getHierarchy(): Promise<Employee[]> {
    return this.employeesService.findHierarchy();
  }

  @Get('roots')
  @ApiOperation({ summary: 'Listar funcionários raiz (sem gerente)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de funcionários raiz retornada com sucesso',
  })
  async getRoots(): Promise<Employee[]> {
    return this.employeesService.findRoots();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  @ApiParam({ name: 'id', description: 'UUID do funcionário' })
  @ApiResponse({
    status: 200,
    description: 'Funcionário encontrado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  // ==================== POST ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo funcionário' })
  @ApiResponse({
    status: 201,
    description: 'Funcionário criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar múltiplos funcionários (seed)' })
  @ApiBody({
    type: [CreateEmployeeDto],
    description: 'Array de funcionários a serem criados',
    examples: {
      default: {
        summary: 'Exemplo com 3 funcionários',
        value: [
          {
            name: 'Ana Silva',
            title: 'Tech Lead',
            reports_to_id: null,
            profile_image_url: 'img/ana-silva.png',
            timezone: 'America/Sao_Paulo',
          },
          {
            name: 'Carlos Santos',
            title: 'Senior Backend Developer',
            reports_to_id: 'a197d5ac-2252-4064-b19b-0d5850517dc3',
            profile_image_url: 'img/carlos-santos.png',
            timezone: 'America/Sao_Paulo',
          },
          {
            name: 'Maria Oliveira',
            title: 'Frontend Developer',
            reports_to_id: 'a197d5ac-2252-4064-b19b-0d5850517dc3',
            profile_image_url: 'img/maria-oliveira.png',
            timezone: 'Europe/London',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Funcionários criados com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createBulk(
    @Body() employees: CreateEmployeeDto[],
  ): Promise<Employee[]> {
    return this.employeesService.createBulk(employees);
  }

  // ==================== PUT ====================

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  @ApiParam({ name: 'id', description: 'UUID do funcionário' })
  @ApiResponse({
    status: 200,
    description: 'Funcionário atualizado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Put(':id/hierarchy')
  @ApiOperation({ summary: 'Atualizar hierarquia do funcionário' })
  @ApiParam({ name: 'id', description: 'UUID do funcionário' })
  @ApiResponse({
    status: 200,
    description: 'Hierarquia atualizada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou ciclo detectado na hierarquia',
  })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async updateHierarchy(
    @Param('id') id: string,
    @Body() updateHierarchyDto: UpdateHierarchyDto,
  ): Promise<Employee> {
    return this.employeesService.updateHierarchy(id, updateHierarchyDto);
  }

  // ==================== DELETE ====================

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover funcionário' })
  @ApiParam({ name: 'id', description: 'UUID do funcionário' })
  @ApiResponse({ status: 204, description: 'Funcionário removido com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Funcionário possui subordinados',
  })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}
