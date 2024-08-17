import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('spendings', function(table) {
        table.increments('id').primary();
        table.decimal('amount', 8, 2).notNullable();
        table.string('category').notNullable();
        table.string('username').notNullable();
        table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('spendings');
}

