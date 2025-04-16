// import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
// import { CreateCampingDto } from './dto/create-camping.dto';
// import { CampingsService } from './campings.service';
// import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
// import { ApiBearerAuth } from '@nestjs/swagger';
// // import { FormDataRequest } from 'nestjs-form-data';

// @Controller('campings')
// @ApiBearerAuth()
// export class CampingsController {
//   constructor(private readonly campingsService: CampingsService) {}

//   @Post()
//   @UseGuards(AuthGuardGuard)
//   // @FormDataRequest()
//   async create(@Request() req, @Body() createCampingDto: CreateCampingDto) {
//     console.log('createCampingDto:', createCampingDto); // <-- Agrega esto

//     return await this.campingsService.create(createCampingDto, req?.user.id, req?.files);
//   }

//   @Get()
//   async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
//     const pageNumber = Number(page);
//     const limitNumber = Number(limit);

//     return this.campingsService.findAll(pageNumber, limitNumber);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.campingsService.remove(+id);
//   }
// }

import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Request,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';

import { FormDataRequest } from 'nestjs-form-data';

import { CreateCampingDto } from './dto/create-camping.dto';

import { FileInterceptor } from '@nestjs/platform-express';

import { AuthGuardGuard } from 'src/guards/auth-guard.guard';

import { ApiBearerAuth } from '@nestjs/swagger';
import { CampingsService } from './campings.service';

@Controller('campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard)
  @FormDataRequest()
  @UseInterceptors(FileInterceptor('images'))
  async create(@Request() req, @Body() createCampingDto: CreateCampingDto) {
    console.log('createCampingDto:', createCampingDto);

    return await this.campingsService.create(createCampingDto, req?.user.id, req?.files);
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
