export type DashboardEventType = 'VACCINE' | 'MEDICATION';

export interface DashboardEvent {
  type: DashboardEventType;
  petId: string;
  petName: string;
  title: string;
  scheduledFor: string;
  status: 'TODAY' | 'UPCOMING';
  daysUntil: number;
  metadata?: {
    category?: string;
    dosage?: string;
    frequency?: string;
    time?: string | null;
  };
}

export interface DashboardSummary {
  pets: number;
  vaccinesUpcoming: number;
  medicationsActive: number;
  notificationsSent: number;
  notificationsFailed: number;
}

export interface RecentNotification {
  id: string;
  status: string;
  type: string;
  scheduledFor: Date;
  pet: {
    id: string;
    name: string;
  };
}

export interface DashboardResponse {
  summary: DashboardSummary;
  today: DashboardEvent[];
  upcoming: DashboardEvent[];
  recentNotifications: RecentNotification[];
}
