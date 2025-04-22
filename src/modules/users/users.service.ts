import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {

    const users = await this.prisma.user.findMany();

    if (!users) throw new NotFoundException('Users not found');


    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  async findById(id: string) {

    
    
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        campings: true,
      },
    });
    
    if (!user) throw new NotFoundException('User not found');
    
    if (!isUUID(id)) throw new BadRequestException('User ID not valid');


    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }


  // async create(data: any) {}

  async update(id: string, data: any) {

    if (!isUUID(id)) throw new BadRequestException('User ID not valid');

    const user = await this.prisma.user.findUnique({where: {id}})

    if (!user) throw new NotFoundException('User not found');

    return await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {

    if (!isUUID(id)) throw new BadRequestException('User ID not valid');

    const user = await this.prisma.user.delete({
      where: {
        id,
      },
    });
    
    if (!user) throw new NotFoundException('User not found');

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
