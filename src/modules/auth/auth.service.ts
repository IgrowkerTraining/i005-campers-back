import { Injectable,Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: UserCreateDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      
      this.logger.log('Trying to register new user', data.email);
      
      const newUser = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          owner: data?.owner ?? false,
        },
      });

      
      this.logger.log('Successfully registered user', newUser.email);
      
      return newUser;
    } catch (error) {
     
      if (error.code === 'P2002') {
        this.logger.error('Attempt to register duplicate user', error);
        throw new Error('The user with this email already exists');
      }
      
      
      this.logger.error('Registration error', error);
      throw error;
    }
  }
  async logIn(data: LoginRequestDto) {
    this.logger.log('Trying to log in', data.email);

      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        
        this.logger.warn('Login failed - User not found', data.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      const validatePassword = await bcrypt.compare(data.password, user.password);
      
      if (!validatePassword) {
       
        this.logger.warn('Login failed - Incorrect password', data.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log('Successful login', user.email);

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
    } catch (error) {
     
      this.logger.error('Error during login', error);
      throw error;
    }
  }
