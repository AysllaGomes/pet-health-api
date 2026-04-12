import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';

import { UsersController } from './users.controller';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar usersService.create com o dto e retornar o resultado', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Nome',
        email: 'nome@email.com',
        password: '123456',
      };

      const createdUser = {
        id: '1',
        name: 'Nome',
        email: 'nome@email.com',
        createdAt: new Date('2026-04-12T10:00:00.000Z'),
      };

      usersServiceMock.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(usersServiceMock.create).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('deve chamar usersService.findAll e retornar a lista de usuários', async () => {
      const users = [
        {
          id: '1',
          name: 'Nome',
          email: 'nome@email.com',
          createdAt: new Date('2026-04-12T10:00:00.000Z'),
        },
        {
          id: '2',
          name: 'Outro usuário',
          email: 'outro_user@email.com',
          createdAt: new Date('2026-04-11T10:00:00.000Z'),
        },
      ];

      usersServiceMock.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(usersServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('deve chamar usersService.findOne com o id e retornar o usuário', async () => {
      const user = {
        id: '1',
        name: 'Nome',
        email: 'nome@email.com',
        createdAt: new Date('2026-04-12T10:00:00.000Z'),
      };

      usersServiceMock.findOne.mockResolvedValue(user);

      const result = await controller.findOne('1');

      expect(usersServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('deve chamar usersService.update com id e dto e retornar o usuário atualizado', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Outro Nome',
        password: '654321',
      };

      const updatedUser = {
        id: '1',
        name: 'Nome Usuário',
        email: 'nome@email.com',
      };

      usersServiceMock.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(usersServiceMock.update).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('deve chamar usersService.remove com o id e retornar o usuário removido', async () => {
      const removedUser = {
        id: '1',
        name: 'Nome',
        email: 'nome@email.com',
      };

      usersServiceMock.remove.mockResolvedValue(removedUser);

      const result = await controller.remove('1');

      expect(usersServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(removedUser);
    });
  });
});
