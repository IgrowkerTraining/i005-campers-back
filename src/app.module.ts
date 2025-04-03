import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CampingsModule } from './modules/campings/campings.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampingsService } from './modules/campings/campings.service';

@Module({
  imports: [UsersModule, CampingsModule, AuthModule],
  controllers: [],
  providers: [CampingsService],
})
export class AppModule {}
