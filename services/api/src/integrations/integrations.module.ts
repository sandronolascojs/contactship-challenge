import { Module } from '@nestjs/common';
import { RandomuserApiService } from './randomuser-api';

@Module({
  providers: [RandomuserApiService],
  exports: [RandomuserApiService],
})
export class IntegrationsModule {}
