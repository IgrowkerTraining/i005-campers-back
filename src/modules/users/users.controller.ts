import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getAllAppointments(): string {
    return 'hola usuarios';
  }
}
