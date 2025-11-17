import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  // Habilitar CORS para o frontend
  app.enableCors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true,
  });

  // Habilitar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Dockyard API')
    .setDescription('API para gerenciamento de hierarquia de funcionários')
    .setVersion('1.0')
    .addTag('employees', 'Endpoints de funcionários')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Dockyard API - Documentação',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Dockyard API v1.0.0`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Server:        http://localhost:${port}`);
  console.log(`📚 Documentation: http://localhost:${port}/api`);
  console.log(`💚 Health Check:  http://localhost:${port}/health`);
  console.log(`${'='.repeat(60)}\n`);
}

void bootstrap();
