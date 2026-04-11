import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { VaccineReminderService } from './services/vaccine-reminder.service';
import { MedicationReminderService } from './services/medication-reminder.service';

@Injectable()
export class RemindersService {
  constructor(
    private readonly vaccineReminderService: VaccineReminderService,
    private readonly medicationReminderService: MedicationReminderService,
  ) {}

  @Cron(CronExpression.EVERY_8_HOURS)
  async handleVaccineReminders(): Promise<void> {
    await this.vaccineReminderService.process();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleMedicationReminders(): Promise<void> {
    await this.medicationReminderService.process();
  }
}
