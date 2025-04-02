import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get()
  getAllAppointments(): string {
    return 'Login/Register';
  }
}
