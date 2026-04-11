import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Pet Health API')
    .setDescription(
      'API para gerenciamento de saúde de pets, com vacinas, tratamentos e lembretes automáticos.',
    )
    .setVersion('1.0.0')
    .addTag('users', 'Operações de usuários')
    .addTag('pets', 'Operações de pets')
    .addTag('vaccines', 'Operações de vacinas e tratamentos')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(3000);
  console.log('API running on http://localhost:3000');
  console.log('Swagger available at http://localhost:3000/docs');
}

bootstrap();
