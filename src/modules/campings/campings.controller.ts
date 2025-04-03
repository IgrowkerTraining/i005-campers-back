import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CreateCampingDto } from './dto/create-camping.dto';
import { CampingsService } from './campings.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('campings')
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createCampingDto: CreateCampingDto) {
    return await this.campingsService.create(createCampingDto, req.user.id);
  }

  @Get()
 async findAll() {
    
    return await this.campingsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campingsService.remove(+id)

  }
}