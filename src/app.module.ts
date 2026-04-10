import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';

import { AppController } from './app.controller';

import { PetsModule } from './pets/pets.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { VaccinesModule } from './vaccines/vaccines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    PetsModule,
    VaccinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
