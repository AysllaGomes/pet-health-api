import { Test, TestingModule } from '@nestjs/testing';

import { RemindersService } from './reminders.service';
import { VaccineReminderService } from './services/vaccine-reminder.service';
import { MedicationReminderService } from './services/medication-reminder.service';

describe('RemindersService', () => {
  let service: RemindersService;

  const vaccineReminderServiceMock = {
    process: jest.fn(),
  };

  const medicationReminderServiceMock = {
    process: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        {
          provide: VaccineReminderService,
          useValue: vaccineReminderServiceMock,
        },
        {
          provide: MedicationReminderService,
          useValue: medicationReminderServiceMock,
        },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('handleVaccineReminders', () => {
    it('deve chamar vaccineReminderService.process', async () => {
      vaccineReminderServiceMock.process.mockResolvedValue(undefined);

      await service.handleVaccineReminders();

      expect(vaccineReminderServiceMock.process).toHaveBeenCalledTimes(1);
      expect(medicationReminderServiceMock.process).not.toHaveBeenCalled();
    });
  });

  describe('handleMedicationReminders', () => {
    it('deve chamar medicationReminderService.process', async () => {
      medicationReminderServiceMock.process.mockResolvedValue(undefined);

      await service.handleMedicationReminders();

      expect(medicationReminderServiceMock.process).toHaveBeenCalledTimes(1);
      expect(vaccineReminderServiceMock.process).not.toHaveBeenCalled();
    });
  });
});
