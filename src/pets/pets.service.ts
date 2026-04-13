import { Injectable, NotFoundException } from '@nestjs/common';

import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createPetDto: CreatePetDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.pet.create({
      data: {
        userId,
        ...createPetDto,
        birthDate: createPetDto.birthDate
          ? new Date(createPetDto.birthDate)
          : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.pet.findMany({
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
  }

  async findOne(id: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }

    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto) {
    await this.findOne(id);

    return this.prisma.pet.update({
      where: { id },
      data: {
        ...updatePetDto,
        birthDate: updatePetDto.birthDate
          ? new Date(updatePetDto.birthDate)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.pet.delete({
      where: { id },
    });
  }
}
