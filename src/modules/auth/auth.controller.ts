import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCreateDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() data: UserCreateDto) {
    return await this.authService.register(data);
  }

  @Post('login')
  async LogIn(@Body() data: LoginRequestDto) {
    return await this.authService.logIn(data);
  }
}
