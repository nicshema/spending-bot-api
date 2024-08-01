import { Update, Ctx, Start, Help, On, Hears, Message } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Context extends Scenes.SceneContext {}

@Update()
export class BotUpdate {
  constructor() {} // @InjectBot('one_love_spending_bot') private readonly bot: Telegraf<Context>,

  @Start()
  async start(ctx: Context) {
    await ctx.reply('Welcome');
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async on(@Ctx() ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hears(@Ctx() ctx: Context) {
    await ctx.reply('Hey there');
  }

  @On('text')
  onMessage(@Message('text') text: string): string {
    return text;
  }
}
