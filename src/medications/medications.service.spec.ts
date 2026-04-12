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
      findUnique: jest.fn(),
    },
    medication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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
    it('deve criar um medicamento quando o pet existir', async () => {
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

      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
        name: 'Thor',
      });
      prismaMock.medication.create.mockResolvedValue(createdMedication);

      const result = await service.create(dto);

      expect(prismaMock.pet.findUnique).toHaveBeenCalledWith({
        where: { id: dto.petId },
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

      const createdMedication = {
        id: 'med-1',
        petId: dto.petId,
        name: dto.name,
        dosage: dto.dosage,
        frequency: dto.frequency,
        startDate: new Date(dto.startDate),
        endDate: undefined,
        time: undefined,
        notes: undefined,
        reminderMinutesBefore: 60,
      };

      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
      });
      prismaMock.medication.create.mockResolvedValue(createdMedication);

      const result = await service.create(dto);

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

      expect(result).toEqual(createdMedication);
    });

    it('deve criar sem endDate quando ela não for informada', async () => {
      const dto: CreateMedicationDto = {
        petId: 'pet-1',
        name: 'Prednisona',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        startDate: '2026-04-11',
        time: '08:00',
      };

      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
      });
      prismaMock.medication.create.mockResolvedValue({
        id: 'med-1',
        ...dto,
      });

      await service.create(dto);

      expect(prismaMock.medication.create).toHaveBeenCalledWith({
        data: {
          petId: dto.petId,
          name: dto.name,
          dosage: dto.dosage,
          frequency: dto.frequency,
          startDate: new Date(dto.startDate),
          endDate: undefined,
          time: dto.time,
          notes: undefined,
          reminderMinutesBefore: 60,
        },
      });
    });

    it('deve lançar NotFoundException quando o pet não existir', async () => {
      const dto: CreateMedicationDto = {
        petId: 'pet-invalido',
        name: 'Prednisona',
        dosage: '1 comprimido',
        frequency: '1x ao dia',
        startDate: '2026-04-11',
      };

      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);

      expect(prismaMock.pet.findUnique).toHaveBeenCalledWith({
        where: { id: dto.petId },
      });
      expect(prismaMock.medication.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de medicamentos com pet e usuário', async () => {
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

      const result = await service.findAll();

      expect(prismaMock.medication.findMany).toHaveBeenCalledWith({
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
    it('deve retornar um medicamento pelo id', async () => {
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

      prismaMock.medication.findUnique.mockResolvedValue(medication);

      const result = await service.findOne('med-1');

      expect(prismaMock.medication.findUnique).toHaveBeenCalledWith({
        where: { id: 'med-1' },
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

    it('deve lançar NotFoundException quando o medicamento não existir', async () => {
      prismaMock.medication.findUnique.mockResolvedValue(null);

      await expect(service.findOne('med-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.medication.findUnique).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        include: {
          pet: {
            include: {
              user: true,
            },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar um medicamento com conversão de datas', async () => {
      const dto: UpdateMedicationDto = {
        petId: 'pet-1',
        name: 'Prednisona Atualizada',
        dosage: '2 comprimidos',
        frequency: '2x ao dia',
        startDate: '2026-04-12',
        endDate: '2026-04-22',
        time: '09:00',
        notes: 'Atualizado',
        reminderMinutesBefore: 45,
      };

      const existingMedication = {
        id: 'med-1',
        name: 'Prednisona',
        pet: {
          id: 'pet-1',
          user: {
            id: 'user-1',
          },
        },
      };

      const updatedMedication = {
        id: 'med-1',
        ...dto,
        startDate: new Date(dto.startDate!),
        endDate: new Date(dto.endDate!),
      };

      prismaMock.medication.findUnique.mockResolvedValue(existingMedication);
      prismaMock.medication.update.mockResolvedValue(updatedMedication);

      const result = await service.update('med-1', dto);

      expect(prismaMock.medication.update).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        data: {
          petId: dto.petId,
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

      expect(result).toEqual(updatedMedication);
    });

    it('deve atualizar um medicamento sem datas opcionais quando não informadas', async () => {
      const dto: UpdateMedicationDto = {
        name: 'Prednisona Atualizada',
        dosage: '1 comprimido',
      };

      const existingMedication = {
        id: 'med-1',
        name: 'Prednisona',
        pet: {
          id: 'pet-1',
          user: {
            id: 'user-1',
          },
        },
      };

      prismaMock.medication.findUnique.mockResolvedValue(existingMedication);
      prismaMock.medication.update.mockResolvedValue({
        id: 'med-1',
        ...dto,
      });

      const result = await service.update('med-1', dto);

      expect(prismaMock.medication.update).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        data: {
          petId: undefined,
          name: dto.name,
          dosage: dto.dosage,
          frequency: undefined,
          startDate: undefined,
          endDate: undefined,
          time: undefined,
          notes: undefined,
          reminderMinutesBefore: undefined,
        },
      });

      expect(result).toEqual({
        id: 'med-1',
        ...dto,
      });
    });

    it('deve lançar NotFoundException ao tentar atualizar um medicamento inexistente', async () => {
      prismaMock.medication.findUnique.mockResolvedValue(null);

      await expect(service.update('med-1', { name: 'Teste' })).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.medication.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um medicamento existente', async () => {
      const existingMedication = {
        id: 'med-1',
        name: 'Prednisona',
        pet: {
          id: 'pet-1',
          user: {
            id: 'user-1',
          },
        },
      };

      const deletedMedication = {
        id: 'med-1',
        name: 'Prednisona',
      };

      prismaMock.medication.findUnique.mockResolvedValue(existingMedication);
      prismaMock.medication.delete.mockResolvedValue(deletedMedication);

      const result = await service.remove('med-1');

      expect(prismaMock.medication.delete).toHaveBeenCalledWith({
        where: { id: 'med-1' },
      });

      expect(result).toEqual(deletedMedication);
    });

    it('deve lançar NotFoundException ao tentar remover um medicamento inexistente', async () => {
      prismaMock.medication.findUnique.mockResolvedValue(null);

      await expect(service.remove('med-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.medication.delete).not.toHaveBeenCalled();
    });
  });
});
