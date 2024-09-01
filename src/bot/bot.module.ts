import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SpendingsModule } from '../spendings/spendings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development' ? 'development.env' : '.env',
    }),
    SpendingsModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule, SpendingsModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        launchOptions: {
          webhook: {
            domain: configService.get('WEBHOOK_URL'),
            path: '/telegraf',
          },
        },
        token: configService.get('BOT_TOKEN'),
        include: [BotModule],
      }),
    }),
  ],
  providers: [BotUpdate],
})
export class BotModule {}
