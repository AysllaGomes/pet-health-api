import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

import { PetsService } from './pets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PetsService', () => {
  let service: PetsService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    pet: {
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
        PetsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um pet quando o usuário existir', async () => {
      const dto: CreatePetDto = {
        userId: 'user-1',
        name: 'Thor',
        species: 'dog',
        breed: 'Golden Retriever',
        birthDate: '2020-05-10',
        weight: 30,
        notes: 'Pet saudável',
      };

      const createdPet = {
        id: 'pet-1',
        ...dto,
        birthDate: new Date('2020-05-10'),
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Ayslla',
        email: 'ayslla@email.com',
      });

      prismaMock.pet.create.mockResolvedValue(createdPet);

      const result = await service.create(dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.userId },
      });

      expect(prismaMock.pet.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          birthDate: new Date('2020-05-10'),
        },
      });

      expect(result).toEqual(createdPet);
    });

    it('deve criar um pet sem birthDate quando ela não for informada', async () => {
      const dto: CreatePetDto = {
        userId: 'user-1',
        name: 'Thor',
        species: 'dog',
        breed: 'Golden Retriever',
        weight: 30,
        notes: 'Sem data informada',
      };

      const createdPet = {
        id: 'pet-1',
        ...dto,
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
      });

      prismaMock.pet.create.mockResolvedValue(createdPet);

      const result = await service.create(dto);

      expect(prismaMock.pet.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          birthDate: undefined,
        },
      });

      expect(result).toEqual(createdPet);
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      const dto: CreatePetDto = {
        userId: 'user-invalido',
        name: 'Thor',
        species: 'dog',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.userId },
      });

      expect(prismaMock.pet.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de pets com os dados do usuário', async () => {
      const pets = [
        {
          id: 'pet-1',
          name: 'Thor',
          species: 'dog',
          user: {
            id: 'user-1',
            name: 'Ayslla',
            email: 'ayslla@email.com',
          },
          createdAt: new Date('2026-04-12T10:00:00.000Z'),
        },
      ];

      prismaMock.pet.findMany.mockResolvedValue(pets);

      const result = await service.findAll();

      expect(prismaMock.pet.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(pets);
    });
  });

  describe('findOne', () => {
    it('deve retornar um pet pelo id', async () => {
      const pet = {
        id: 'pet-1',
        name: 'Thor',
        species: 'dog',
        user: {
          id: 'user-1',
          name: 'Ayslla',
          email: 'ayslla@email.com',
        },
      };

      prismaMock.pet.findUnique.mockResolvedValue(pet);

      const result = await service.findOne('pet-1');

      expect(prismaMock.pet.findUnique).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
        include: {
          user: true,
        },
      });

      expect(result).toEqual(pet);
    });

    it('deve lançar NotFoundException quando o pet não existir', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.findOne('pet-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.pet.findUnique).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
        include: {
          user: true,
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar um pet com birthDate convertida para Date', async () => {
      const dto: UpdatePetDto = {
        name: 'Thor Atualizado',
        birthDate: '2021-01-15',
        notes: 'Atualizado',
      };

      const existingPet = {
        id: 'pet-1',
        name: 'Thor',
        species: 'dog',
        user: {
          id: 'user-1',
        },
      };

      const updatedPet = {
        id: 'pet-1',
        name: 'Thor Atualizado',
        species: 'dog',
        birthDate: new Date('2021-01-15'),
        notes: 'Atualizado',
      };

      prismaMock.pet.findUnique.mockResolvedValue(existingPet);
      prismaMock.pet.update.mockResolvedValue(updatedPet);

      const result = await service.update('pet-1', dto);

      expect(prismaMock.pet.findUnique).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
        include: {
          user: true,
        },
      });

      expect(prismaMock.pet.update).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
        data: {
          ...dto,
          birthDate: new Date('2021-01-15'),
        },
      });

      expect(result).toEqual(updatedPet);
    });

    it('deve atualizar um pet sem birthDate quando ela não for informada', async () => {
      const dto: UpdatePetDto = {
        name: 'Thor Atualizado',
        notes: 'Sem data',
      };

      const existingPet = {
        id: 'pet-1',
        name: 'Thor',
        species: 'dog',
        user: {
          id: 'user-1',
        },
      };

      const updatedPet = {
        id: 'pet-1',
        name: 'Thor Atualizado',
        species: 'dog',
        notes: 'Sem data',
      };

      prismaMock.pet.findUnique.mockResolvedValue(existingPet);
      prismaMock.pet.update.mockResolvedValue(updatedPet);

      const result = await service.update('pet-1', dto);

      expect(prismaMock.pet.update).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
        data: {
          ...dto,
          birthDate: undefined,
        },
      });

      expect(result).toEqual(updatedPet);
    });

    it('deve lançar NotFoundException ao tentar atualizar um pet inexistente', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.update('pet-1', { name: 'Teste' })).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.pet.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um pet existente', async () => {
      const existingPet = {
        id: 'pet-1',
        name: 'Thor',
        species: 'dog',
        user: {
          id: 'user-1',
        },
      };

      const deletedPet = {
        id: 'pet-1',
        name: 'Thor',
        species: 'dog',
      };

      prismaMock.pet.findUnique.mockResolvedValue(existingPet);
      prismaMock.pet.delete.mockResolvedValue(deletedPet);

      const result = await service.remove('pet-1');

      expect(prismaMock.pet.delete).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
      });

      expect(result).toEqual(deletedPet);
    });

    it('deve lançar NotFoundException ao tentar remover um pet inexistente', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.remove('pet-1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.pet.delete).not.toHaveBeenCalled();
    });
  });
});
