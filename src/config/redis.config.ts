import { Logger } from '@nestjs/common';
import { createKeyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

export async function redisConfig() {
  const logger = new Logger('Redis');
  try {
    const redisStore = createKeyv(
      'redis://default:pO1dxzciR6xC3w15n4aAQaPhtBd2Ud@redis-15222.c241.us-east-1-4.ec2.redns.redis-cloud.com:15222',
    );

    await redisStore.set('connection-test', 'ok', 1000);
    logger.log('Conectado a Redis con exito');

    return {
      store: redisStore,
      ttl: 60000,
    };
  } catch (err) {
    logger.warn(`Error en la coneccion con Redis:, ${err.message} ----- Se usara cache en local ----`);

    return {
      store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
      ttl: 60000,
    };
  }
}
