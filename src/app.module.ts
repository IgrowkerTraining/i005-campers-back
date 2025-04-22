import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CampingsModule } from './modules/campings/campings.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampingsService } from './modules/campings/campings.service';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MercadoPagoModule } from './modules/mercado-pago/mercado-pago.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => redisConfig(),
      isGlobal: true,
    }),
    UsersModule,
    CampingsModule,
    AuthModule,
    ReservationsModule,
    MercadoPagoModule,
    JwtModule.register(jwtConfig()),
    CloudinaryModule,
  ],
  controllers: [],
  providers: [CampingsService],
})
export class AppModule {}
