import { Test, TestingModule } from '@nestjs/testing';

import { VaccinesService } from './vaccines.service';

import { VaccinesController } from './vaccines.controller';

import { CreateVaccineDto, VaccineCategoryDto } from './dto/create-vaccine.dto';

describe('VaccinesController', () => {
  let controller: VaccinesController;

  const vaccinesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const currentUser = {
    userId: 'user-1',
    email: 'ayslla@email.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VaccinesController],
      providers: [
        {
          provide: VaccinesService,
          useValue: vaccinesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<VaccinesController>(VaccinesController);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar vaccinesService.create com userId e dto', async () => {
      const dto: CreateVaccineDto = {
        petId: 'pet-1',
        name: 'Vacina Anual',
        category: VaccineCategoryDto.VACCINE,
        applicationDate: '2026-04-11',
        nextDoseDate: '2027-04-11',
        veterinarian: 'Dra. Ana',
        clinic: 'Clínica Pet Feliz',
        notes: 'Aplicação sem intercorrências',
        reminderDaysBefore: 7,
      };

      const createdVaccine = {
        id: 'vac-1',
        ...dto,
      };

      vaccinesServiceMock.create.mockResolvedValue(createdVaccine);

      const result = await controller.create(dto, currentUser);

      expect(vaccinesServiceMock.create).toHaveBeenCalledTimes(1);
      expect(vaccinesServiceMock.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(createdVaccine);
    });
  });

  describe('findAll', () => {
    it('deve chamar vaccinesService.findAll com userId', async () => {
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

      vaccinesServiceMock.findAll.mockResolvedValue(vaccines);

      const result = await controller.findAll(currentUser);

      expect(vaccinesServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(vaccinesServiceMock.findAll).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(vaccines);
    });
  });
});
