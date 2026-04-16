import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  DashboardEvent,
  DashboardResponse,
} from './interfaces/dashboard-response.interface';

import { DashboardEventType } from '../common/enums/dashboard-event-type.enum';
import { NotificationStatus } from 'src/common/enums/notification-status.enum';
import { DashboardEventStatus } from '../common/enums/dashboard-event-status.enum';

@Injectable()
export class DashboardService {
  private static readonly UPCOMING_LIMIT = 10;

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string): Promise<DashboardResponse> {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfTomorrow = new Date(endOfToday);
    startOfTomorrow.setMilliseconds(startOfTomorrow.getMilliseconds() + 1);

    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    const next30Days = new Date(now);
    next30Days.setDate(next30Days.getDate() + 30);
    next30Days.setHours(23, 59, 59, 999);

    const [
      petsCount,
      vaccinesUpcomingCount,
      medicationsActiveCount,
      notificationsSentCount,
      notificationsFailedCount,
      todayVaccines,
      upcomingVaccines,
      activeMedications,
      recentNotifications,
    ] = await Promise.all([
      this.prisma.pet.count({
        where: { userId },
      }),

      this.prisma.vaccine.count({
        where: {
          pet: { userId },
          nextDoseDate: {
            gte: startOfToday,
            lte: next30Days,
          },
        },
      }),

      this.prisma.medication.count({
        where: {
          pet: { userId },
          startDate: { lte: endOfToday },
          OR: [{ endDate: null }, { endDate: { gte: startOfToday } }],
        },
      }),

      this.prisma.notification.count({
        where: {
          pet: { userId },
          status: NotificationStatus.SENT,
        },
      }),

      this.prisma.notification.count({
        where: {
          pet: { userId },
          status: NotificationStatus.FAILED,
        },
      }),

      this.prisma.vaccine.findMany({
        where: {
          pet: { userId },
          nextDoseDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          nextDoseDate: 'asc',
        },
      }),

      this.prisma.vaccine.findMany({
        where: {
          pet: { userId },
          nextDoseDate: {
            gte: startOfTomorrow,
            lte: next7Days,
          },
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          nextDoseDate: 'asc',
        },
      }),

      this.prisma.medication.findMany({
        where: {
          pet: { userId },
          startDate: { lte: next7Days },
          OR: [{ endDate: null }, { endDate: { gte: startOfToday } }],
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
      }),

      this.prisma.notification.findMany({
        where: {
          pet: { userId },
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          scheduledFor: 'desc',
        },
        take: 5,
      }),
    ]);

    const todayMedicationEvents = activeMedications
      .filter((medication) =>
        this.isMedicationRelevantForDate(medication, startOfToday),
      )
      .map((medication) =>
        this.mapMedicationToEvent(
          medication,
          startOfToday,
          DashboardEventStatus.TODAY,
        ),
      );

    const upcomingMedicationEvents = activeMedications
      .filter((medication) =>
        this.isMedicationRelevantForUpcoming(
          medication,
          startOfTomorrow,
          next7Days,
        ),
      )
      .map((medication) =>
        this.mapMedicationToEvent(
          medication,
          this.getUpcomingMedicationBaseDate(medication, startOfTomorrow),
          DashboardEventStatus.UPCOMING,
        ),
      )
      .filter(
        (event) =>
          new Date(event.scheduledFor).getTime() >= startOfTomorrow.getTime(),
      );

    const todayVaccineEvents = todayVaccines.map((vaccine) =>
      this.mapVaccineToEvent(vaccine, DashboardEventStatus.TODAY),
    );

    const upcomingVaccineEvents = upcomingVaccines.map((vaccine) =>
      this.mapVaccineToEvent(vaccine, DashboardEventStatus.UPCOMING),
    );

    const today = this.sortEvents([
      ...todayVaccineEvents,
      ...todayMedicationEvents,
    ]);

    const upcoming = this.sortEvents([
      ...upcomingVaccineEvents,
      ...upcomingMedicationEvents,
    ]).slice(0, DashboardService.UPCOMING_LIMIT);

    return {
      summary: {
        pets: petsCount,
        vaccinesUpcoming: vaccinesUpcomingCount,
        medicationsActive: medicationsActiveCount,
        notificationsSent: notificationsSentCount,
        notificationsFailed: notificationsFailedCount,
      },
      today,
      upcoming,
      recentNotifications,
    };
  }

  private sortEvents(events: DashboardEvent[]): DashboardEvent[] {
    return [...events].sort(
      (a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
    );
  }

  private getUpcomingMedicationBaseDate(
    medication: {
      startDate: Date;
    },
    startOfTomorrow: Date,
  ): Date {
    return medication.startDate > startOfTomorrow
      ? medication.startDate
      : startOfTomorrow;
  }

  private mapVaccineToEvent(
    vaccine: {
      id: string;
      name: string;
      category: string;
      nextDoseDate: Date | null;
      pet: { id: string; name: string };
    },
    status: DashboardEventStatus,
  ): DashboardEvent {
    const scheduledFor = vaccine.nextDoseDate ?? new Date();

    return {
      type: DashboardEventType.VACCINE,
      petId: vaccine.pet.id,
      petName: vaccine.pet.name,
      title: vaccine.name,
      scheduledFor: scheduledFor.toISOString(),
      status,
      daysUntil: this.getDaysUntil(scheduledFor),
      metadata: {
        category: vaccine.category,
      },
    };
  }

  private mapMedicationToEvent(
    medication: {
      id: string;
      name: string;
      dosage: string;
      frequency: string;
      time: string | null;
      startDate: Date;
      pet: { id: string; name: string };
    },
    baseDate: Date,
    status: DashboardEventStatus,
  ): DashboardEvent {
    const scheduledFor = this.buildMedicationDateTime(
      baseDate,
      medication.time,
    );

    return {
      type: DashboardEventType.MEDICATION,
      petId: medication.pet.id,
      petName: medication.pet.name,
      title: medication.name,
      scheduledFor: scheduledFor.toISOString(),
      status,
      daysUntil: this.getDaysUntil(scheduledFor),
      metadata: {
        dosage: medication.dosage,
        frequency: medication.frequency,
        time: medication.time,
      },
    };
  }

  private buildMedicationDateTime(baseDate: Date, time?: string | null): Date {
    const date = new Date(baseDate);

    if (!time) {
      date.setHours(9, 0, 0, 0);
      return date;
    }

    const [hours, minutes] = time.split(':').map(Number);

    date.setHours(hours ?? 9, minutes ?? 0, 0, 0);
    return date;
  }

  private getDaysUntil(date: Date): number {
    const now = new Date();

    const startNow = new Date(now);
    startNow.setHours(0, 0, 0, 0);

    const startTarget = new Date(date);
    startTarget.setHours(0, 0, 0, 0);

    const diffMs = startTarget.getTime() - startNow.getTime();

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  private isMedicationRelevantForDate(
    medication: {
      startDate: Date;
      endDate: Date | null;
    },
    targetDate: Date,
  ): boolean {
    const start = new Date(medication.startDate);
    start.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const end = medication.endDate ? new Date(medication.endDate) : null;

    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    return start <= target && (!end || end >= target);
  }

  private isMedicationRelevantForUpcoming(
    medication: {
      startDate: Date;
      endDate: Date | null;
    },
    startOfTomorrow: Date,
    rangeEnd: Date,
  ): boolean {
    const start = new Date(medication.startDate);
    const end = medication.endDate ? new Date(medication.endDate) : null;

    return start <= rangeEnd && (!end || end >= startOfTomorrow);
  }
}
