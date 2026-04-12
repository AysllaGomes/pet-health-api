import { Test, TestingModule } from '@nestjs/testing';

import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

describe('MedicationsController', () => {
  let controller: MedicationsController;

  const medicationsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationsController],
      providers: [
        {
          provide: MedicationsService,
          useValue: medicationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MedicationsController>(MedicationsController);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar medicationsService.create com o dto e retornar o resultado', async () => {
      const dto: CreateMedicationDto = {
        petId: 'pet-1',
        name: 'Prednisona',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        startDate: '2026-04-11',
        endDate: '2026-04-20',
        time: '08:00',
        notes: 'Dar junto com alimento',
        reminderMinutesBefore: 30,
      };

      const createdMedication = {
        id: 'med-1',
        petId: dto.petId,
        name: dto.name,
        dosage: dto.dosage,
        frequency: dto.frequency,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate!),
        time: dto.time,
        notes: dto.notes,
        reminderMinutesBefore: dto.reminderMinutesBefore,
      };

      medicationsServiceMock.create.mockResolvedValue(createdMedication);

      const result = await controller.create(dto);

      expect(medicationsServiceMock.create).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdMedication);
    });
  });

  describe('findAll', () => {
    it('deve chamar medicationsService.findAll e retornar a lista', async () => {
      const medications = [
        {
          id: 'med-1',
          name: 'Prednisona',
          dosage: '1 comprimido',
          frequency: '1x ao dia',
          pet: {
            id: 'pet-1',
            name: 'Thor',
            user: {
              id: 'user-1',
              name: 'Ayslla',
              email: 'ayslla@email.com',
            },
          },
        },
      ];

      medicationsServiceMock.findAll.mockResolvedValue(medications);

      const result = await controller.findAll();

      expect(medicationsServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(medications);
    });
  });

  describe('findOne', () => {
    it('deve chamar medicationsService.findOne com o id e retornar o medicamento', async () => {
      const medication = {
        id: 'med-1',
        name: 'Prednisona',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        pet: {
          id: 'pet-1',
          name: 'Thor',
        },
      };

      medicationsServiceMock.findOne.mockResolvedValue(medication);

      const result = await controller.findOne('med-1');

      expect(medicationsServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.findOne).toHaveBeenCalledWith('med-1');
      expect(result).toEqual(medication);
    });
  });

  describe('update', () => {
    it('deve chamar medicationsService.update com id e dto e retornar o medicamento atualizado', async () => {
      const dto: UpdateMedicationDto = {
        name: 'Prednisona Atualizada',
        dosage: '2 comprimidos',
        frequency: '2x ao dia',
        startDate: '2026-04-12',
        endDate: '2026-04-22',
        time: '09:00',
        notes: 'Atualizado',
        reminderMinutesBefore: 45,
      };

      const updatedMedication = {
        id: 'med-1',
        ...dto,
        startDate: new Date(dto.startDate!),
        endDate: new Date(dto.endDate!),
      };

      medicationsServiceMock.update.mockResolvedValue(updatedMedication);

      const result = await controller.update('med-1', dto);

      expect(medicationsServiceMock.update).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.update).toHaveBeenCalledWith('med-1', dto);
      expect(result).toEqual(updatedMedication);
    });
  });

  describe('remove', () => {
    it('deve chamar medicationsService.remove com o id e retornar o medicamento removido', async () => {
      const removedMedication = {
        id: 'med-1',
        name: 'Prednisona',
      };

      medicationsServiceMock.remove.mockResolvedValue(removedMedication);

      const result = await controller.remove('med-1');

      expect(medicationsServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.remove).toHaveBeenCalledWith('med-1');
      expect(result).toEqual(removedMedication);
    });
  });
});
