import { Test, TestingModule } from '@nestjs/testing';

import { MedicationsService } from './medications.service';

import { MedicationsController } from './medications.controller';

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

  const currentUser = {
    userId: 'user-1',
    email: 'ayslla@email.com',
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
    it('deve chamar medicationsService.create com userId e dto', async () => {
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
        ...dto,
      };

      medicationsServiceMock.create.mockResolvedValue(createdMedication);

      const result = await controller.create(dto, currentUser);

      expect(medicationsServiceMock.create).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(createdMedication);
    });
  });

  describe('findAll', () => {
    it('deve chamar medicationsService.findAll com userId e paginação', async () => {
      const query = {
        page: 1,
        limit: 10,
      };

      const medications = {
        data: [
          {
            id: 'med-1',
            name: 'Prednisona',
            pet: {
              id: 'pet-1',
              name: 'Thor',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      medicationsServiceMock.findAll.mockResolvedValue(medications);

      const result = await controller.findAll(currentUser, query);

      expect(medicationsServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.findAll).toHaveBeenCalledWith(
        'user-1',
        query,
      );
      expect(result).toEqual(medications);
    });
  });

  describe('findOne', () => {
    it('deve chamar medicationsService.findOne com userId e id', async () => {
      const medication = {
        id: 'med-1',
        name: 'Prednisona',
      };

      medicationsServiceMock.findOne.mockResolvedValue(medication);

      const result = await controller.findOne('med-1', currentUser);

      expect(medicationsServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.findOne).toHaveBeenCalledWith(
        'user-1',
        'med-1',
      );
      expect(result).toEqual(medication);
    });
  });

  describe('update', () => {
    it('deve chamar medicationsService.update com userId, id e dto', async () => {
      const dto: UpdateMedicationDto = {
        name: 'Prednisona Atualizada',
        dosage: '2 comprimidos',
      };

      const updatedMedication = {
        id: 'med-1',
        ...dto,
      };

      medicationsServiceMock.update.mockResolvedValue(updatedMedication);

      const result = await controller.update('med-1', dto, currentUser);

      expect(medicationsServiceMock.update).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.update).toHaveBeenCalledWith(
        'user-1',
        'med-1',
        dto,
      );
      expect(result).toEqual(updatedMedication);
    });
  });

  describe('remove', () => {
    it('deve chamar medicationsService.remove com userId e id', async () => {
      const removedMedication = {
        id: 'med-1',
        name: 'Prednisona',
      };

      medicationsServiceMock.remove.mockResolvedValue(removedMedication);

      const result = await controller.remove('med-1', currentUser);

      expect(medicationsServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(medicationsServiceMock.remove).toHaveBeenCalledWith(
        'user-1',
        'med-1',
      );
      expect(result).toEqual(removedMedication);
    });
  });
});
