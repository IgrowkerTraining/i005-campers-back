import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Response, NotFoundException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async create(@Body() createReservationDto: CreateReservationDto) {
    return await this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.reservationsService.findOne(+id);

    if (!result) throw new NotFoundException();

    return result;
  }

  @Get('campingId/:id')
  findByCampingId(@Param('id') id: number) {
    return this.reservationsService.findByCampingId(+id);
  }

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

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(+id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.reservationsService.remove(+id);
  }
}
