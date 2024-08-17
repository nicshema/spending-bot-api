import { Update, Ctx, Start, Help, On, Hears, Message } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { Inject } from '@nestjs/common';
import { KNEX_INSTANCE } from '../knex/knex.module';
import { Knex } from 'knex';
import { ADD_SPEND } from 'src/input/patterns';
import {
  CreateSpending,
  Spending,
} from 'src/knex/interfaces/entities/spending';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Context extends Scenes.SceneContext {}

@Update()
export class BotUpdate {
  constructor(@Inject(KNEX_INSTANCE) private readonly knex: Knex) {} // @InjectBot('one_love_spending_bot') private readonly bot: Telegraf<Context>,

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
  async onMessage(@Message('text') text: string, @Ctx() ctx: Context) {
    const execResult = ADD_SPEND.exec(text);
    if (execResult?.groups?.category && execResult?.groups?.cost) {
      console.log(execResult.groups);
      const [id] = await this.knex<CreateSpending>('spendings').insert({
        category: execResult.groups.category,
        amount: parseFloat(execResult.groups.cost).toFixed(2),
        username: ctx.message.from.username,
      });

      const result = await this.knex<Spending>('spendings as s1')
        // @ts-ignore
        .innerJoin(
          'spendings as s2',
          this.knex.raw('DATE(s1.created_at)'),
          '=',
          this.knex.raw('DATE(s2.created_at)'),
        )
        .where('s2.id', id)
        .select('s1.category')
        .sum('s1.amount as amount')
        .groupBy('s1.category');
      console.log(result);
      ctx.reply(`Added!
      
Summary for today:
${result.map((row: any) => `\n${row.category} - ${row.amount}`)}

Total: ${result.reduce((acc, { amount }) => acc + parseFloat(amount), 0)}
      `);
    } else {
      ctx.reply('Wrong input');
    }
  }
}
