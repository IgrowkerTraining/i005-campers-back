import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { Roles } from 'src/decorators/roles.decorators';

import { Role } from 'src/common/enums/role.enum';

import { RolesGuard } from 'src/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuardGuard)
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    return await this.userService.create(data);
  }

  @Get(':id')
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return await this.userService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
