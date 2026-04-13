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
      findFirst: jest.fn(),
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
        name: 'Thor',
        species: 'dog',
        breed: 'Golden Retriever',
        birthDate: '2020-05-10',
        weight: 30,
        notes: 'Pet saudável',
      };

      const createdPet = {
        id: 'pet-1',
        userId: 'user-1',
        ...dto,
        birthDate: new Date('2020-05-10'),
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Ayslla',
        email: 'ayslla@email.com',
      });

      prismaMock.pet.create.mockResolvedValue(createdPet);

      const result = await service.create('user-1', dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });

      expect(prismaMock.pet.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          ...dto,
          birthDate: new Date('2020-05-10'),
        },
      });

      expect(result).toEqual(createdPet);
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      const dto: CreatePetDto = {
        name: 'Thor',
        species: 'dog',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.create('user-invalido', dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.pet.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar apenas os pets do usuário informado', async () => {
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
        },
      ];

      prismaMock.pet.findMany.mockResolvedValue(pets);

      const result = await service.findAll('user-1');

      expect(prismaMock.pet.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
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
    it('deve retornar um pet do usuário pelo id', async () => {
      const pet = {
        id: 'pet-1',
        userId: 'user-1',
        name: 'Thor',
        species: 'dog',
        user: {
          id: 'user-1',
          name: 'Ayslla',
          email: 'ayslla@email.com',
        },
      };

      prismaMock.pet.findFirst.mockResolvedValue(pet);

      const result = await service.findOne('user-1', 'pet-1');

      expect(prismaMock.pet.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'pet-1',
          userId: 'user-1',
        },
        include: {
          user: true,
        },
      });

      expect(result).toEqual(pet);
    });

    it('deve lançar NotFoundException quando o pet não existir para o usuário', async () => {
      prismaMock.pet.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'pet-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.pet.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'pet-1',
          userId: 'user-1',
        },
        include: {
          user: true,
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar um pet do usuário', async () => {
      const dto: UpdatePetDto = {
        name: 'Thor Atualizado',
        birthDate: '2021-01-15',
        notes: 'Atualizado',
      };

      prismaMock.pet.findFirst.mockResolvedValue({
        id: 'pet-1',
        userId: 'user-1',
        name: 'Thor',
      });

      prismaMock.pet.update.mockResolvedValue({
        id: 'pet-1',
        userId: 'user-1',
        name: 'Thor Atualizado',
      });

      const result = await service.update('user-1', 'pet-1', dto);

      expect(prismaMock.pet.update).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
        data: {
          ...dto,
          birthDate: new Date('2021-01-15'),
        },
      });

      expect(result).toEqual({
        id: 'pet-1',
        userId: 'user-1',
        name: 'Thor Atualizado',
      });
    });

    it('deve lançar NotFoundException ao tentar atualizar pet de outro usuário', async () => {
      prismaMock.pet.findFirst.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'pet-1', { name: 'Teste' }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.pet.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um pet do usuário', async () => {
      prismaMock.pet.findFirst.mockResolvedValue({
        id: 'pet-1',
        userId: 'user-1',
        name: 'Thor',
      });

      prismaMock.pet.delete.mockResolvedValue({
        id: 'pet-1',
        name: 'Thor',
      });

      const result = await service.remove('user-1', 'pet-1');

      expect(prismaMock.pet.delete).toHaveBeenCalledWith({
        where: { id: 'pet-1' },
      });

      expect(result).toEqual({
        id: 'pet-1',
        name: 'Thor',
      });
    });

    it('deve lançar NotFoundException ao tentar remover pet de outro usuário', async () => {
      prismaMock.pet.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'pet-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.pet.delete).not.toHaveBeenCalled();
    });
  });
});
