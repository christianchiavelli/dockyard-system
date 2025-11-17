import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Employee } from './employees/employee.entity';
import { EmployeesModule } from './employees/employees.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Apenas para desenvolvimento
      logging: true,
    }),
    TypeOrmModule.forFeature([Employee]),
    EmployeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
