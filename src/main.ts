import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(3000);
  console.log('API running on http://localhost:3000');
}
bootstrap();
