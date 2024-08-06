import { Knex } from 'knex';
import { ModuleMetadata } from '@nestjs/common';

export interface NestKnexOptions extends Knex.Config {}

export interface NestKnexAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args) => Promise<NestKnexOptions> | NestKnexOptions;
  inject?: any[];
}
