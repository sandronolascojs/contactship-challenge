import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [],
      useFactory: async (configService: ConfigService) => {
        const cacheStrategy = configService.get<'memory' | 'redis'>('CACHE_STRATEGY');

        if (cacheStrategy === 'redis') {
          return {
            store: await redisStore({
              socket: {
                host: configService.get<string>('REDIS_HOST') ?? 'localhost',
                port: configService.get<number>('REDIS_PORT') ?? 6379,
              },
              password: configService.get<string>('REDIS_PASSWORD'),
              database: configService.get<number>('REDIS_DB') ?? 0,
            }),
          };
        }

        return {};
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
