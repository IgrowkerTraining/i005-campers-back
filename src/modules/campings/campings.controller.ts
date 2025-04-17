import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CreateCampingDto } from './dto/create-camping.dto';
import { CampingsService } from './campings.service';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorators';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
  async create(@Request() req, @Body() createCampingDto: CreateCampingDto) {
    return await this.campingsService.create(createCampingDto, req?.user.id);
  }

  @Get()
  async findAll() {
    return await this.campingsService.findAll();
  }

  @Delete(':id')
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
  remove(@Param('id') id: string) {
    return this.campingsService.remove(+id);
  }
}
