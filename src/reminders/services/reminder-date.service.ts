import { Injectable } from '@nestjs/common';

import { VaccineReminderPlan } from '../types/reminder.types';

@Injectable()
export class ReminderDateService {
  buildVaccineReminderPlans(
    category: 'VACCINE' | 'ANTIPARASITIC' | 'DEWORMER',
    nextDoseDate: Date,
    reminderDaysBefore: number,
  ): VaccineReminderPlan[] {
    const isSpecialType =
      category === 'ANTIPARASITIC' || category === 'DEWORMER';

    if (isSpecialType) {
      const buyDate = new Date(nextDoseDate);
      buyDate.setUTCDate(buyDate.getUTCDate() - 5);
      buyDate.setUTCHours(0, 0, 0, 0);

      const applyDate = new Date(nextDoseDate);
      applyDate.setUTCHours(0, 0, 0, 0);

      return [
        { kind: 'BUY', date: buyDate },
        { kind: 'APPLY', date: applyDate },
      ];
    }

    const defaultReminderDate = new Date(nextDoseDate);
    defaultReminderDate.setUTCDate(
      defaultReminderDate.getUTCDate() - reminderDaysBefore,
    );
    defaultReminderDate.setUTCHours(0, 0, 0, 0);

    return [{ kind: 'DEFAULT', date: defaultReminderDate }];
  }

  getUtcDayRange(reference: Date): { start: Date; end: Date } {
    const start = new Date(reference);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(reference);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
  }

  getMedicationReminderDateTime(
    now: Date,
    time: string,
    reminderMinutesBefore: number,
  ): Date {
    const [hours, minutes] = time.split(':').map(Number);

    const medicationDateTime = new Date(now);
    medicationDateTime.setHours(hours, minutes, 0, 0);

    const reminderDateTime = new Date(medicationDateTime);
    reminderDateTime.setMinutes(
      reminderDateTime.getMinutes() - reminderMinutesBefore,
    );

    return reminderDateTime;
  }

  isSameMinute(dateA: Date, dateB: Date): boolean {
    const a = new Date(dateA);
    a.setSeconds(0, 0);

    const b = new Date(dateB);
    b.setSeconds(0, 0);

    return a.getTime() === b.getTime();
  }

  getUtcStartOfDay(reference: Date): Date {
    const date = new Date(reference);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  getUtcEndOfDay(reference: Date): Date {
    const date = new Date(reference);
    date.setUTCHours(23, 59, 59, 999);
    return date;
  }

  getLocalStartOfDay(reference: Date): Date {
    const date = new Date(reference);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  getLocalEndOfDay(reference: Date): Date {
    const date = new Date(reference);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  formatLocalDateTime(date: Date): string {
    return date.toLocaleString('pt-BR');
  }

  formatUtcDateTime(date: Date): string {
    return date.toISOString();
  }
}
