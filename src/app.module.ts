import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { KnexModule } from './knex/knex.module';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { SpendingsModule } from './spendings/spendings.module';

@Module({
  imports: [
    ConfigModule,
    BotModule,
    KnexModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        client: 'mysql2',
        connection: {
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          database: configService.get('DB_NAME'),
          user: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    SpendingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
