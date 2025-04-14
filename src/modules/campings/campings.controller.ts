import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CreateCampingDto } from './dto/create-camping.dto';
import { CampingsService } from './campings.service';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard)
  async create(@Request() req, @Body() createCampingDto: CreateCampingDto) {
    return await this.campingsService.create(createCampingDto, req?.user.id);
  }

  @Get()
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.campingsService.findAll(pageNumber, limitNumber);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campingsService.remove(+id);
  }
}
