import { Module } from '@nestjs/common';

import { MailModule } from '../mail/mail.module';

import { RemindersService } from './reminders.service';

@Module({
  imports: [MailModule],
  providers: [RemindersService],
})
export class RemindersModule {}
