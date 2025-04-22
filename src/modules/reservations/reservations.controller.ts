import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Response,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';

@Controller('reservations')
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(AuthGuardGuard)
  @Post()
  async create(@Body() createReservationDto: CreateReservationDto) {
    return await this.reservationsService.create(createReservationDto);
  }

  @UseGuards(AuthGuardGuard)
  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @UseGuards(AuthGuardGuard)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.reservationsService.findOne(+id);

    if (!result) throw new NotFoundException();

    return result;
  }

  @UseGuards(AuthGuardGuard)
  @Get('campingId/:id')
  findByCampingId(@Param('id') id: number) {
    return this.reservationsService.findByCampingId(+id);
  }

  @UseGuards(AuthGuardGuard)
  @Get('campingId/:id/occupancy')
  @ApiQuery({
    name: 'start',
    type: String,
    format: 'date',
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end',
    type: String,
    format: 'date',
    description: 'Fecha de fin (YYYY-MM-DD)',
  })
  @ApiOperation({
    description:
      'Devuelve la cantidad total de personas y carpas por día en los cuales hay alguna reserva en el camping, entre dos fechas dadas.',
  })
  async GetOccupancy(@Param('id') id: number, @Query('start') startDate: string, @Query('end') endDate: string) {
    const result = await this.reservationsService.availabilityPerDay({ campingId: +id, startDate, endDate });

    return Object.fromEntries(result);
  }

  @UseGuards(AuthGuardGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(+id, updateReservationDto);
  }

  @UseGuards(AuthGuardGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.reservationsService.remove(+id);
  }
}
