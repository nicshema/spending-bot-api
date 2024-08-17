import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // await NestFactory.createApplicationContext(AppModule);
  const app = await NestFactory.create(AppModule);
  const bot: Telegraf = app.get(getBotToken());
  const configService = app.get(ConfigService);
  const authorizedUsers: string[] = configService.get('USERS_LIST').split(' ');
  bot.use((ctx: Context, next) => {
    const userName = ctx.from.username;
    if (authorizedUsers.includes(userName)) {
      return next();
    }
    ctx.reply('This bot is not for you');
  });
  app.use(bot.webhookCallback('/telegraf'));
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
void bootstrap();
