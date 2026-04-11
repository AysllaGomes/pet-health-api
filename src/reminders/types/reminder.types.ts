export type ReminderKind = 'DEFAULT' | 'BUY' | 'APPLY';

export type ReminderType =
  | 'VACCINE_DEFAULT'
  | 'VACCINE_BUY'
  | 'VACCINE_APPLY'
  | 'MEDICATION';

export interface MedicationReminderContext {
  petId: string;
  medicationId: string;
  emailTo: string;
  tutorName: string;
  petName: string;
  medicationName: string;
  dosage: string;
  time: string;
  scheduledFor: Date;
}
