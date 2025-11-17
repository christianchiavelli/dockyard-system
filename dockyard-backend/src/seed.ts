import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app.module';
import { CreateEmployeeDto } from './employees/employee.dto';
import { EmployeesService } from './employees/employees.service';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const employeesService = app.get(EmployeesService);

  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await employeesService.clear();
    console.log('✓ Dados existentes limpos');

    // Ler arquivo JSON
    const jsonPath = path.join(__dirname, '..', 'employees.json');

    if (!fs.existsSync(jsonPath)) {
      console.error(
        '❌ Arquivo employees.json não encontrado na raiz do projeto',
      );
      console.log(
        '💡 Crie o arquivo employees.json na raiz com os dados dos funcionários',
      );
      process.exit(1);
    }

    const employeesData = JSON.parse(
      fs.readFileSync(jsonPath, 'utf-8'),
    ) as CreateEmployeeDto[];
    console.log(
      `✓ Arquivo JSON carregado: ${employeesData.length} funcionários encontrados`,
    );

    // Inserir funcionários em lote
    await employeesService.createBulk(employeesData);
    console.log(`✓ ${employeesData.length} funcionários inseridos com sucesso`);

    // Estatísticas
    const roots = await employeesService.findRoots();
    console.log(`\n📊 Estatísticas:`);
    console.log(`   - Total de funcionários: ${employeesData.length}`);
    console.log(`   - Funcionários raiz (sem gerente): ${roots.length}`);

    console.log('\n✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
