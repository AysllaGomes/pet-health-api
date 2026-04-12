import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { VaccinesService } from './vaccines.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateVaccineDto, VaccineCategoryDto } from './dto/create-vaccine.dto';

describe('VaccinesService', () => {
  let service: VaccinesService;

  const prismaMock = {
    pet: {
      findUnique: jest.fn(),
    },
    vaccine: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaccinesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<VaccinesService>(VaccinesService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar vacina quando o pet existir', async () => {
      const dto: CreateVaccineDto = {
        petId: 'pet-1',
        name: 'Vacina Anual',
        category: VaccineCategoryDto.VACCINE,
        applicationDate: '2026-04-11',
        nextDoseDate: '2027-04-11',
        veterinarian: 'Dra. Ana',
        clinic: 'Clínica Pet Feliz',
        notes: 'Aplicação sem intercorrências',
        reminderDaysBefore: 10,
      };

      const createdVaccine = {
        id: 'vac-1',
        petId: 'pet-1',
        name: 'Vacina Anual',
        category: VaccineCategoryDto.VACCINE,
        applicationDate: new Date('2026-04-11'),
        nextDoseDate: new Date('2027-04-11'),
        veterinarian: 'Dra. Ana',
        clinic: 'Clínica Pet Feliz',
        notes: 'Aplicação sem intercorrências',
        reminderDaysBefore: 10,
      };

      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
        name: 'Thor',
      });

      prismaMock.vaccine.create.mockResolvedValue(createdVaccine);

      const result = await service.create(dto);

      expect(prismaMock.pet.findUnique).toHaveBeenCalledWith({
        where: { id: dto.petId },
      });

      expect(prismaMock.vaccine.create).toHaveBeenCalledWith({
        data: {
          petId: dto.petId,
          name: dto.name,
          category: dto.category,
          applicationDate: new Date(dto.applicationDate),
          nextDoseDate: new Date(dto.nextDoseDate!),
          veterinarian: dto.veterinarian,
          clinic: dto.clinic,
          notes: dto.notes,
          reminderDaysBefore: dto.reminderDaysBefore,
        },
      });

      expect(result).toEqual(createdVaccine);
    });

    it('deve aplicar valores padrão para category e reminderDaysBefore', async () => {
      const dto: CreateVaccineDto = {
        petId: 'pet-1',
        name: 'Antirrábica',
        applicationDate: '2026-04-11',
      };

      const createdVaccine = {
        id: 'vac-2',
        petId: 'pet-1',
        name: 'Antirrábica',
        category: 'VACCINE',
        applicationDate: new Date('2026-04-11'),
        nextDoseDate: undefined,
        veterinarian: undefined,
        clinic: undefined,
        notes: undefined,
        reminderDaysBefore: 7,
      };

      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
        name: 'Thor',
      });

      prismaMock.vaccine.create.mockResolvedValue(createdVaccine);

      const result = await service.create(dto);

      expect(prismaMock.vaccine.create).toHaveBeenCalledWith({
        data: {
          petId: dto.petId,
          name: dto.name,
          category: 'VACCINE',
          applicationDate: new Date(dto.applicationDate),
          nextDoseDate: undefined,
          veterinarian: undefined,
          clinic: undefined,
          notes: undefined,
          reminderDaysBefore: 7,
        },
      });

      expect(result).toEqual(createdVaccine);
    });

    it('deve criar vacina sem nextDoseDate quando ela não for informada', async () => {
      const dto: CreateVaccineDto = {
        petId: 'pet-1',
        name: 'Vermífugo',
        category: VaccineCategoryDto.DEWORMER,
        applicationDate: '2026-04-11',
        veterinarian: 'Dr. João',
      };

      prismaMock.pet.findUnique.mockResolvedValue({
        id: 'pet-1',
      });

      prismaMock.vaccine.create.mockResolvedValue({
        id: 'vac-3',
        petId: 'pet-1',
        name: 'Vermífugo',
      });

      await service.create(dto);

      expect(prismaMock.vaccine.create).toHaveBeenCalledWith({
        data: {
          petId: dto.petId,
          name: dto.name,
          category: VaccineCategoryDto.DEWORMER,
          applicationDate: new Date(dto.applicationDate),
          nextDoseDate: undefined,
          veterinarian: dto.veterinarian,
          clinic: undefined,
          notes: undefined,
          reminderDaysBefore: 7,
        },
      });
    });

    it('deve lançar NotFoundException quando o pet não existir', async () => {
      const dto: CreateVaccineDto = {
        petId: 'pet-invalido',
        name: 'Vacina Anual',
        applicationDate: '2026-04-11',
      };

      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);

      expect(prismaMock.pet.findUnique).toHaveBeenCalledWith({
        where: { id: dto.petId },
      });

      expect(prismaMock.vaccine.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de vacinas com dados do pet', async () => {
      const vaccines = [
        {
          id: 'vac-1',
          name: 'Vacina Anual',
          category: 'VACCINE',
          applicationDate: new Date('2026-04-11'),
          pet: {
            id: 'pet-1',
            name: 'Thor',
          },
        },
      ];

      prismaMock.vaccine.findMany.mockResolvedValue(vaccines);

      const result = await service.findAll();

      expect(prismaMock.vaccine.findMany).toHaveBeenCalledWith({
        include: {
          pet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { applicationDate: 'desc' },
      });

      expect(result).toEqual(vaccines);
    });
  });
});
