import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { InferModel } from 'drizzle-orm';
import { dateTime, dateTimeDefaultSQL } from './customTypes';

export const addressTable = sqliteTable('Address', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  createdAt: dateTime('createdAt').notNull().default(dateTimeDefaultSQL),
  line1: text('line1'),
  line2: text('line2'),
  city: text('city'),
  state: text('state'),
  countryAlpha3: text('countryAlpha3').notNull(),
  postCode: text('postCode'),
});
export type AddressInsertType = InferModel<typeof addressTable, 'insert'>;
export type AddressSelectType = InferModel<typeof addressTable, 'select'>;

export const customerTable = sqliteTable(
  'Customer',
  {
    id: integer('id').notNull().primaryKey({ autoIncrement: true }),
    createdAt: dateTime('createdAt').notNull().default(dateTimeDefaultSQL),
    updatedAt: dateTime('updatedAt').notNull().default(dateTimeDefaultSQL),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    email: text('email').notNull(),
    addressId: integer('addressId').references(() => addressTable.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => ({
    emailIdx: index('Customer_email_idx').on(table.email),
  })
);
export type CustomerInsertType = InferModel<typeof customerTable, 'insert'>;
export type CustomerSelectType = InferModel<typeof customerTable, 'select'>;
