import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampingDto } from './dto/create-camping.dto';

@Injectable()
export class CampingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.camping.findMany({
      include: {
        location: true,
        pricing: true,
        amenities: true,
        nearbyAttractions: true 
      }
    });
  }

  async remove(id: number) {
    return this.prisma.camping.delete({
      where: { id }
    });
  }

  async create(createCampingDto: CreateCampingDto, data: Prisma.CampingCreateInput) {
    return this.prisma.camping.create({
      data,
      include: {
        location: true,
        pricing: true,
        amenities: true,
        nearbyAttractions: true 
      }
    });
  }
}
