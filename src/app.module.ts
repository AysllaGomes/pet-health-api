import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppService } from './app.service';

import { AppController } from './app.controller';

import { PetsModule } from './pets/pets.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { VaccinesModule } from './vaccines/vaccines.module';
import { RemindersModule } from './reminders/reminders.module';
import { MedicationsModule } from './medications/medications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    PetsModule,
    VaccinesModule,
    MailModule,
    RemindersModule,
    MedicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
