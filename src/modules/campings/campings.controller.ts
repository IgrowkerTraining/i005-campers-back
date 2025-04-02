import { Controller, Get } from '@nestjs/common';

@Controller('campings')
export class CampingsController {
  @Get()
  getAllAppointments(): string {
    return 'hola';
  }
}
