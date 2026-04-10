import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';

import { AppController } from './app.controller';

import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
