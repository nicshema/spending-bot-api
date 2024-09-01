import { Inject, Injectable } from '@nestjs/common';
import { KNEX_INSTANCE } from '../../knex/knex.module';
import { Knex } from 'knex';
import {
  CreateSpending,
  Spending,
} from '../../knex/interfaces/entities/spending';
import { dateToMysqlTimestamp } from '../../util/date-to-mysql-timestamp';

const TABLE_NAME = 'spendings';

@Injectable()
export class SpendingsService {
  constructor(@Inject(KNEX_INSTANCE) private readonly knex: Knex) {}

  public async insert(data: CreateSpending): Promise<number> {
    const [id] = await this.knex<CreateSpending>(TABLE_NAME).insert(data);
    return id;
  }

  public async getOneById(id: number): Promise<Spending> {
    const result = await this.knex<Spending>(TABLE_NAME).where('id', id);
    if (result.length === 0) {
      throw new Error('Not found');
    }
    return result[0];
  }

  public async insertAndReturnInstance(
    data: CreateSpending,
  ): Promise<Spending> {
    const id = await this.insert(data);
    return this.getOneById(id);
  }

  public async getForThePeriod(
    from: Date,
    to: Date,
    groupByCategory = false,
  ): Promise<Spending[]> {
    const groupBy = groupByCategory ? ['category'] : [];
    const queryBuilder = this.knex<Spending>(`${TABLE_NAME} as s`)
      .where(
        this.knex.raw('DATE(s.created_at)'),
        '>=',
        this.knex.raw(`DATE('${dateToMysqlTimestamp(from)}')`),
      )
      .andWhere(
        this.knex.raw('DATE(s.created_at)'),
        '<=',
        this.knex.raw(`DATE('${dateToMysqlTimestamp(to)}')`),
      );

    if (groupBy.length) {
      return queryBuilder
        .groupBy(...groupBy)
        .select('category')
        .sum('amount as amount');
    }

    return queryBuilder.select('category').select('amount');
  }

  public async getForTheMonth(month: number): Promise<Spending[]> {
    const now = new Date();
    const year = now.getFullYear();
    return this.knex<Spending>(TABLE_NAME).whereBetween('created_at', [
      this.getFirstSecondOfMonth(year, month),
      this.getLastSecondOfMonth(year, month),
    ]);
  }

  private getFirstSecondOfMonth(year: number, month: number): Date {
    return new Date(year, month, 1, 0, 0, 0, 0);
  }

  private getLastSecondOfMonth(year: number, month: number): Date {
    return new Date(this.getFirstSecondOfMonth(year, month + 1).getTime() - 1);
  }
}
