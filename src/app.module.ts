import { Logger, Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { CampingsModule } from './modules/campings/campings.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampingsService } from './modules/campings/campings.service';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.register({
      useFactory: async () => {
        const logger = new Logger('Redis');
        const redisStore = createKeyv(
          'redis://default:pO1dxzciR6xC9i3w15n4aAQhtBd2Ud@redis-15222.c241.us-east-1-4.ec2.redns.redis-cloud.com:15222',
        );
        try {
          await redisStore.set('connection-test', 'ok', 1000);
        } catch (err) {
          logger.error('Redis connection test failed:', err.message);
        }

        return {
          store: redisStore,
          ttl: 300,
        };
      },

      isGlobal: true,
    }),
    UsersModule,
    CampingsModule,
    AuthModule,
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
