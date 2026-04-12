import * as bcrypt from 'bcrypt';

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um usuário com senha criptografada', async () => {
      const dto: CreateUserDto = {
        name: 'Ayslla',
        email: 'ayslla@email.com',
        password: '123456',
      };

      const hashedPassword = 'hashed-password';

      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaMock.user.create.mockResolvedValue({
        id: '1',
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });

      const result = await service.create(dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          password: hashedPassword,
        },
      });

      expect(result).toEqual({
        id: '1',
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });
    });

    it('deve lançar ConflictException se o email já estiver cadastrado', async () => {
      const dto: CreateUserDto = {
        name: 'Ayslla',
        email: 'ayslla@email.com',
        password: '123456',
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: dto.email,
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de usuários ordenada por createdAt desc', async () => {
      const users = [
        {
          id: '1',
          name: 'Ayslla',
          email: 'ayslla@email.com',
          createdAt: new Date('2026-04-01'),
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário pelo id', async () => {
      const user = {
        id: '1',
        name: 'Ayslla',
        email: 'ayslla@email.com',
        createdAt: new Date('2026-04-01'),
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      expect(result).toEqual(user);
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar usuário sem criptografar senha quando password não for enviada', async () => {
      const dto: UpdateUserDto = {
        name: 'Novo Nome',
      };

      const existingUser = {
        id: '1',
        name: 'Ayslla',
        email: 'ayslla@email.com',
        createdAt: new Date('2026-04-01'),
      };

      const updatedUser = {
        id: '1',
        name: 'Novo Nome',
        email: 'ayslla@email.com',
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Novo Nome',
        },
      });

      expect(result).toEqual(updatedUser);
    });

    it('deve atualizar usuário e criptografar a nova senha quando password for enviada', async () => {
      const dto: UpdateUserDto = {
        name: 'Novo Nome',
        password: '654321',
      };

      const existingUser = {
        id: '1',
        name: 'Ayslla',
        email: 'ayslla@email.com',
        createdAt: new Date('2026-04-01'),
      };

      const hashedPassword = 'new-hashed-password';

      const updatedUser = {
        id: '1',
        name: 'Novo Nome',
        email: 'ayslla@email.com',
        password: hashedPassword,
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('654321', 10);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Novo Nome',
          password: hashedPassword,
        },
      });

      expect(result).toEqual(updatedUser);
    });

    it('deve lançar NotFoundException ao tentar atualizar um usuário inexistente', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Teste' })).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um usuário existente', async () => {
      const existingUser = {
        id: '1',
        name: 'Ayslla',
        email: 'ayslla@email.com',
        createdAt: new Date('2026-04-01'),
      };

      const deletedUser = {
        id: '1',
        name: 'Ayslla',
        email: 'ayslla@email.com',
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      prismaMock.user.delete.mockResolvedValue(deletedUser);

      const result = await service.remove('1');

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(result).toEqual(deletedUser);
    });

    it('deve lançar NotFoundException ao tentar remover um usuário inexistente', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.delete).not.toHaveBeenCalled();
    });
  });
});
