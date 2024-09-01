import { Update, Ctx, Start, Help, On, Hears, Message } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { ADD_SPEND, GET_SPENDINGS_FOR_MONTH } from 'src/input/patterns';
import {
  CreateSpending,
  Spending,
} from 'src/knex/interfaces/entities/spending';
import { SpendingsService } from '../spendings/services/spendings.service';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Context extends Scenes.SceneContext {}

@Update()
export class BotUpdate {
  constructor(private readonly spendingsService: SpendingsService) {} // @InjectBot('one_love_spending_bot') private readonly bot: Telegraf<Context>,

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
    let execResult = ADD_SPEND.exec(text);
    if (execResult?.groups?.category && execResult?.groups?.cost) {
      return await this.addSpending(
        {
          category: execResult.groups.category,
          amount: parseFloat(execResult.groups.cost).toFixed(2),
          username: ctx.message.from.username,
        },
        ctx,
      );
    }

    execResult = GET_SPENDINGS_FOR_MONTH.exec(text);
    const month = parseInt(execResult?.groups?.month);
    if (Number.isInteger(month)) {
      return await this.getSummaryForMonth(ctx, month);
    }

    await ctx.reply('Wrong input');
  }

  private async addSpending(data: CreateSpending, ctx: Context): Promise<void> {
    const spending = await this.spendingsService.insertAndReturnInstance(data);
    await ctx.reply(`Added!
${await this.getSummaryForRange(spending.created_at, spending.created_at)}
      `);
  }

  // private async getSpendingForMonth

  private async getSummaryForRange(from: Date, to: Date): Promise<string> {
    const fromCopy = new Date(from);
    fromCopy.setHours(0, 0, 0, 0);
    const toCopy = new Date(to);
    toCopy.setHours(23, 59, 59, 999);
    const spendings = await this.spendingsService.getForThePeriod(
      fromCopy,
      toCopy,
      true,
    );
    return `Summary for ${from.toLocaleDateString('de-DE')} - ${to.toLocaleDateString('de-DE')}:
    ${spendings.map(BotUpdate.rowFormatter)}

Total: ${spendings.reduce(BotUpdate.totalCalculator, 0)}
      `;
  }

  private async getSummaryForMonth(
    ctx,
    month: number,
    year = new Date().getFullYear(),
  ): Promise<void> {
    const firstDayOfNextMonth = new Date(year, month + 1, 1);
    const lastDayOfCurrentMonth = new Date(firstDayOfNextMonth.getTime() - 1);
    const firstDayOfCurrentMonth = new Date(year, month, 1);
    const summary = await this.getSummaryForRange(
      firstDayOfCurrentMonth,
      lastDayOfCurrentMonth,
    );
    await ctx.reply(summary);
  }

  private static totalCalculator(acc: number, { amount }: { amount: string }) {
    return acc + parseFloat(amount);
  }

  private static rowFormatter(row: Spending) {
    return `\n${row.category} - ${row.amount}`;
  }
}
