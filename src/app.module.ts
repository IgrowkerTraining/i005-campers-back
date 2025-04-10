import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CampingsModule } from './modules/campings/campings.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampingsService } from './modules/campings/campings.service';
import { JwtModule } from '@nestjs/jwt';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [
    UsersModule,
    CampingsModule,
    AuthModule,
    ReservationsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [],
  providers: [CampingsService],
})
export class AppModule {}
