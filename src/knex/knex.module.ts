import { DynamicModule, FactoryProvider } from '@nestjs/common';
import {
  NestKnexAsyncOptions,
  NestKnexOptions,
} from './interfaces/nest-knex-options';
import { knex } from 'knex';
import { ConfigModule } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';

export const KNEX_OPTIONS = 'KNEX_OPTIONS';
export const KNEX_INSTANCE = 'KNEX_INSTANCE';
@Global()
@Module({})
export class KnexModule {
  static forRootAsync({
    useFactory,
    inject,
  }: NestKnexAsyncOptions): DynamicModule {
    const knexOptions: FactoryProvider = {
      provide: KNEX_OPTIONS,
      useFactory,
      inject: inject || [],
    };
    const knexInstance: FactoryProvider = {
      provide: KNEX_INSTANCE,
      useFactory: (options: NestKnexOptions) => knex(options),
      inject: [KNEX_OPTIONS],
    };
    return {
      module: KnexModule,
      providers: [knexOptions, knexInstance],
      exports: [knexInstance],
      imports: [ConfigModule],
    };
  }
}
