import { Test, TestingModule } from '@nestjs/testing';

import { PetsService } from './pets.service';

import { PetsController } from './pets.controller';

import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

describe('PetsController', () => {
  let controller: PetsController;

  const petsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [
        {
          provide: PetsService,
          useValue: petsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PetsController>(PetsController);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar petsService.create com userId do token e dto', async () => {
      const dto: CreatePetDto = {
        name: 'Thor',
        species: 'dog',
        breed: 'Golden',
        birthDate: '2020-05-10',
        weight: 30,
        notes: 'Saudável',
      };

      const user = {
        userId: 'user-1',
        email: 'ayslla@email.com',
      };

      const createdPet = {
        id: 'pet-1',
        userId: 'user-1',
        ...dto,
      };

      petsServiceMock.create.mockResolvedValue(createdPet);

      const result = await controller.create(dto, user);

      expect(petsServiceMock.create).toHaveBeenCalledTimes(1);
      expect(petsServiceMock.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(createdPet);
    });
  });

  describe('findAll', () => {
    it('deve chamar petsService.findAll e retornar a lista de pets', async () => {
      const pets = [
        {
          id: 'pet-1',
          name: 'Thor',
          species: 'dog',
        },
      ];

      petsServiceMock.findAll.mockResolvedValue(pets);

      const result = await controller.findAll();

      expect(petsServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(pets);
    });
  });

  describe('findOne', () => {
    it('deve chamar petsService.findOne com o id e retornar o pet', async () => {
      const pet = {
        id: 'pet-1',
        name: 'Thor',
        species: 'dog',
      };

      petsServiceMock.findOne.mockResolvedValue(pet);

      const result = await controller.findOne('pet-1');

      expect(petsServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(petsServiceMock.findOne).toHaveBeenCalledWith('pet-1');
      expect(result).toEqual(pet);
    });
  });

  describe('update', () => {
    it('deve chamar petsService.update com id e dto e retornar o pet atualizado', async () => {
      const dto: UpdatePetDto = {
        name: 'Thor Atualizado',
        notes: 'Atualizado',
      };

      const updatedPet = {
        id: 'pet-1',
        name: 'Thor Atualizado',
      };

      petsServiceMock.update.mockResolvedValue(updatedPet);

      const result = await controller.update('pet-1', dto);

      expect(petsServiceMock.update).toHaveBeenCalledTimes(1);
      expect(petsServiceMock.update).toHaveBeenCalledWith('pet-1', dto);
      expect(result).toEqual(updatedPet);
    });
  });

  describe('remove', () => {
    it('deve chamar petsService.remove com o id e retornar o pet removido', async () => {
      const removedPet = {
        id: 'pet-1',
        name: 'Thor',
      };

      petsServiceMock.remove.mockResolvedValue(removedPet);

      const result = await controller.remove('pet-1');

      expect(petsServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(petsServiceMock.remove).toHaveBeenCalledWith('pet-1');
      expect(result).toEqual(removedPet);
    });
  });
});
