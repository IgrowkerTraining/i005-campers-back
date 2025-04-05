import { Body, Controller, Delete, Get, Param, Post, Req, Request, UseGuards } from '@nestjs/common';
import { CreateCampingDto } from './dto/create-camping.dto';
import { CampingsService } from './campings.service';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';

// @Controller('campings')
// export class CampingsController {
//   constructor(private readonly campingsService: CampingsService) {}

//   @Post()
//   // @UseGuards(JwtAuthGuard)
//   async create(@Request() req, @Body() createCampingDto: CreateCampingDto) {
//     return await this.campingsService.create(createCampingDto, req.user.id);
//   }

//   @Get()
//  async findAll() {
    
//     return await this.campingsService.findAll();
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.campingsService.remove(+id)

//   }
// }

@Controller('campings')
export class CampingsController {
  constructor(private campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard)
  async create(@Body() createCampingDto: CreateCampingDto, @Req() req: Request) {
    const userId = req['user'].id; // Assuming userId is in the request (e.g., from auth middleware)
    return this.campingsService.create(createCampingDto, userId);
  }
}