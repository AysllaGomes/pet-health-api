import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { MedicationsService } from './medications.service';

import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

describe('MedicationsService', () => {
  let service: MedicationsService;

  const prismaMock = {
    pet: {
      findFirst: jest.fn(),
    },
    medication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicationsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MedicationsService>(MedicationsService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um medicamento quando o pet pertencer ao usuário', async () => {
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

      prismaMock.pet.findFirst.mockResolvedValue({
        id: 'pet-1',
        userId: 'user-1',
      });

      prismaMock.medication.create.mockResolvedValue(createdMedication);

      const result = await service.create('user-1', dto);

      expect(prismaMock.pet.findFirst).toHaveBeenCalledWith({
        where: {
          id: dto.petId,
          userId: 'user-1',
        },
      });

      expect(prismaMock.medication.create).toHaveBeenCalledWith({
        data: {
          petId: dto.petId,
          name: dto.name,
          dosage: dto.dosage,
          frequency: dto.frequency,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate!),
          time: dto.time,
          notes: dto.notes,
          reminderMinutesBefore: dto.reminderMinutesBefore,
        },
      });

      expect(result).toEqual(createdMedication);
    });

    it('deve aplicar 60 minutos como padrão quando reminderMinutesBefore não for informado', async () => {
      const dto: CreateMedicationDto = {
        petId: 'pet-1',
        name: 'Prednisona',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        startDate: '2026-04-11',
      };

      prismaMock.pet.findFirst.mockResolvedValue({
        id: 'pet-1',
        userId: 'user-1',
      });

      prismaMock.medication.create.mockResolvedValue({
        id: 'med-1',
        reminderMinutesBefore: 60,
      });

      await service.create('user-1', dto);

      expect(prismaMock.medication.create).toHaveBeenCalledWith({
        data: {
          petId: dto.petId,
          name: dto.name,
          dosage: dto.dosage,
          frequency: dto.frequency,
          startDate: new Date(dto.startDate),
          endDate: undefined,
          time: undefined,
          notes: undefined,
          reminderMinutesBefore: 60,
        },
      });
    });

    it('deve lançar NotFoundException quando o pet não pertencer ao usuário', async () => {
      const dto: CreateMedicationDto = {
        petId: 'pet-invalido',
        name: 'Prednisona',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        startDate: '2026-04-11',
      };

      prismaMock.pet.findFirst.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.medication.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar apenas os medicamentos dos pets do usuário', async () => {
      const medications = [
        {
          id: 'med-1',
          name: 'Prednisona',
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

      prismaMock.medication.findMany.mockResolvedValue(medications);

      const result = await service.findAll('user-1');

      expect(prismaMock.medication.findMany).toHaveBeenCalledWith({
        where: {
          pet: {
            userId: 'user-1',
          },
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(medications);
    });
  });

  describe('findOne', () => {
    it('deve retornar um medicamento do usuário pelo id', async () => {
      const medication = {
        id: 'med-1',
        name: 'Prednisona',
        pet: {
          id: 'pet-1',
          name: 'Thor',
          user: {
            id: 'user-1',
            name: 'Ayslla',
            email: 'ayslla@email.com',
          },
        },
      };

      prismaMock.medication.findFirst.mockResolvedValue(medication);

      const result = await service.findOne('user-1', 'med-1');

      expect(prismaMock.medication.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'med-1',
          pet: {
            userId: 'user-1',
          },
        },
        include: {
          pet: {
            include: {
              user: true,
            },
          },
        },
      });

      expect(result).toEqual(medication);
    });

    it('deve lançar NotFoundException quando o medicamento não pertencer ao usuário', async () => {
      prismaMock.medication.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'med-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um medicamento do usuário', async () => {
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

      prismaMock.medication.findFirst.mockResolvedValue({
        id: 'med-1',
        pet: {
          id: 'pet-1',
          user: {
            id: 'user-1',
          },
        },
      });

      prismaMock.medication.update.mockResolvedValue({
        id: 'med-1',
        ...dto,
      });

      const result = await service.update('user-1', 'med-1', dto);

      expect(prismaMock.medication.update).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        data: {
          petId: undefined,
          name: dto.name,
          dosage: dto.dosage,
          frequency: dto.frequency,
          startDate: new Date(dto.startDate!),
          endDate: new Date(dto.endDate!),
          time: dto.time,
          notes: dto.notes,
          reminderMinutesBefore: dto.reminderMinutesBefore,
        },
      });

      expect(result).toEqual({
        id: 'med-1',
        ...dto,
      });
    });

    it('deve validar o novo pet quando petId for informado no update', async () => {
      const dto: UpdateMedicationDto = {
        petId: 'pet-2',
        name: 'Prednisona Atualizada',
      };

      prismaMock.medication.findFirst.mockResolvedValue({
        id: 'med-1',
        pet: {
          id: 'pet-1',
          user: {
            id: 'user-1',
          },
        },
      });

      prismaMock.pet.findFirst.mockResolvedValue({
        id: 'pet-2',
        userId: 'user-1',
      });

      prismaMock.medication.update.mockResolvedValue({
        id: 'med-1',
        ...dto,
      });

      await service.update('user-1', 'med-1', dto);

      expect(prismaMock.pet.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'pet-2',
          userId: 'user-1',
        },
      });
    });

    it('deve lançar NotFoundException se o novo pet não pertencer ao usuário', async () => {
      const dto: UpdateMedicationDto = {
        petId: 'pet-2',
      };

      prismaMock.medication.findFirst.mockResolvedValue({
        id: 'med-1',
      });

      prismaMock.pet.findFirst.mockResolvedValue(null);

      await expect(service.update('user-1', 'med-1', dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.medication.update).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException ao tentar atualizar medicamento de outro usuário', async () => {
      prismaMock.medication.findFirst.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'med-1', { name: 'Teste' }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.medication.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um medicamento do usuário', async () => {
      prismaMock.medication.findFirst.mockResolvedValue({
        id: 'med-1',
        pet: {
          id: 'pet-1',
          user: {
            id: 'user-1',
          },
        },
      });

      prismaMock.medication.delete.mockResolvedValue({
        id: 'med-1',
        name: 'Prednisona',
      });

      const result = await service.remove('user-1', 'med-1');

      expect(prismaMock.medication.delete).toHaveBeenCalledWith({
        where: { id: 'med-1' },
      });

      expect(result).toEqual({
        id: 'med-1',
        name: 'Prednisona',
      });
    });

    it('deve lançar NotFoundException ao tentar remover medicamento de outro usuário', async () => {
      prismaMock.medication.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'med-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.medication.delete).not.toHaveBeenCalled();
    });
  });
});
