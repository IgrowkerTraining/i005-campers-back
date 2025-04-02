import { Module } from '@nestjs/common';
import { DataBase } from './db';


@Module({
  providers: [ DataBase],
  exports: [ DataBase],
})
export class DataBaseModule {}