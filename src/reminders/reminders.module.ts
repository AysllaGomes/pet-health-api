import { Module } from '@nestjs/common';

import { MailModule } from '../mail/mail.module';

import { RemindersService } from './reminders.service';
import { NotificationService } from './services/notification.service';
import { ReminderDateService } from './services/reminder-date.service';
import { VaccineReminderService } from './services/vaccine-reminder.service';
import { MedicationReminderService } from './services/medication-reminder.service';

@Module({
  imports: [MailModule],
  providers: [
    RemindersService,
    NotificationService,
    ReminderDateService,
    VaccineReminderService,
    MedicationReminderService,
  ],
})
export class RemindersModule {}
