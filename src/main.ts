import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  // Validação automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // remove campos não declarados no DTO
      forbidNonWhitelisted: true,
      transform: true,           // converte tipos automaticamente (string → number, etc.)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestão Escolar')
    .setDescription(
      'API RESTful para gestão de estudantes, professores, turmas, notas, faltas e avisos.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth / Usuários')
    .addTag('Estudantes')
    .addTag('Professores')
    .addTag('Turmas')
    .addTag('Disciplinas')
    .addTag('Cursos')
    .addTag('Notas')
    .addTag('Faltas')
    .addTag('Avisos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\nGestão Escolar API running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger docs:                  http://localhost:${port}/api/docs\n`);
}
bootstrap();
