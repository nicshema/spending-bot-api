import { Module } from '@nestjs/common';
import { SpendingsService } from './services/spendings.service';

@Module({
  providers: [SpendingsService],
  exports: [SpendingsService],
})
export class SpendingsModule {}
