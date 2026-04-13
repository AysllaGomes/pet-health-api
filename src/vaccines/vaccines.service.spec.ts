import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { VaccinesService } from './vaccines.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateVaccineDto, VaccineCategoryDto } from './dto/create-vaccine.dto';

describe('VaccinesService', () => {
  let service: VaccinesService;

  const prismaMock = {
    pet: {
      findFirst: jest.fn(),
    },
    vaccine: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
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
    it('deve criar vacina quando o pet pertencer ao usuário', async () => {
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

      prismaMock.pet.findFirst.mockResolvedValue({
        id: 'pet-1',
        userId: 'user-1',
      });

      prismaMock.vaccine.create.mockResolvedValue(createdVaccine);

      const result = await service.create('user-1', dto);

      expect(prismaMock.pet.findFirst).toHaveBeenCalledWith({
        where: {
          id: dto.petId,
          userId: 'user-1',
        },
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

    it('deve lançar NotFoundException quando o pet não pertencer ao usuário', async () => {
      const dto: CreateVaccineDto = {
        petId: 'pet-invalido',
        name: 'Vacina Anual',
        applicationDate: '2026-04-11',
      };

      prismaMock.pet.findFirst.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.pet.findFirst).toHaveBeenCalledWith({
        where: {
          id: dto.petId,
          userId: 'user-1',
        },
      });

      expect(prismaMock.vaccine.create).not.toHaveBeenCalled();
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
        category: VaccineCategoryDto.VACCINE,
        applicationDate: new Date('2026-04-11'),
        nextDoseDate: undefined,
        veterinarian: undefined,
        clinic: undefined,
        notes: undefined,
        reminderDaysBefore: 7,
      };

      prismaMock.pet.findFirst.mockResolvedValue({
        id: 'pet-1',
        userId: 'user-1',
      });

      prismaMock.vaccine.create.mockResolvedValue(createdVaccine);

      const result = await service.create('user-1', dto);

      expect(prismaMock.vaccine.create).toHaveBeenCalledWith({
        data: {
          petId: dto.petId,
          name: dto.name,
          category: VaccineCategoryDto.VACCINE,
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
  });

  describe('findAll', () => {
    it('deve retornar as vacinas dos pets do usuário com paginação padrão', async () => {
      const vaccines = [
        {
          id: 'vac-1',
          name: 'Vacina Anual',
          category: VaccineCategoryDto.VACCINE,
          applicationDate: new Date('2026-04-11'),
          pet: {
            id: 'pet-1',
            name: 'Thor',
          },
        },
      ];

      prismaMock.vaccine.findMany.mockResolvedValue(vaccines);
      prismaMock.vaccine.count.mockResolvedValue(1);

      const result = await service.findAll('user-1', {});

      expect(prismaMock.vaccine.findMany).toHaveBeenCalledWith({
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
            },
          },
        },
        orderBy: { applicationDate: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(prismaMock.vaccine.count).toHaveBeenCalledWith({
        where: {
          pet: {
            userId: 'user-1',
          },
        },
      });

      expect(result).toEqual({
        data: vaccines,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('deve retornar as vacinas com paginação customizada', async () => {
      prismaMock.vaccine.findMany.mockResolvedValue([]);
      prismaMock.vaccine.count.mockResolvedValue(12);

      await service.findAll('user-1', {
        page: 2,
        limit: 5,
      });

      expect(prismaMock.vaccine.findMany).toHaveBeenCalledWith({
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
            },
          },
        },
        orderBy: { applicationDate: 'desc' },
        skip: 5,
        take: 5,
      });

      expect(prismaMock.vaccine.count).toHaveBeenCalledWith({
        where: {
          pet: {
            userId: 'user-1',
          },
        },
      });
    });
  });
});
