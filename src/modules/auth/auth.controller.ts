import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}


  @Post('signup')
 async register(@Body() data: any) {
    return await this.authService.register(data)
  }

  @Post('login') 
 async LogIn(@Body() data: any) {
    return await this.authService.logIn(data)

  }
}
