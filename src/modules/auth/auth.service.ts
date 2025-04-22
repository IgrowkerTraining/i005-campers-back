import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: UserCreateDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

   try {return await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        owner: data?.owner ?? false,
      },
    });}
    catch (error) {
      if (error.code === 'P2002') {
        throw new Error('El usuario con este correo electrónico ya existe');
      }
      throw error
    }
  }

  async logIn(data: LoginRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const validatePassword = await bcrypt.compare(data.password, user.password);

    if (!validatePassword)
      throw new UnauthorizedException('Invalid credentials');

    // const {password, ...withoutPassword} = user

    const payload = {
      id: user.id,
      email: user.email,
      owner: user.owner,
    };

    const token = this.jwtService.sign(payload);

    const { owner, ...userWithoutOwner } = user;

    return {
      user: userWithoutOwner,
      email: user.email,
      token,
      owner,
    };
  }
}
