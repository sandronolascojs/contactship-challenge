import { relations } from 'drizzle-orm';
import { index, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { idField } from '../utils/id';
import { timestampWithTimezone } from '../utils/timestamp';
import { leads } from './leads.schema';

export const persons = pgTable(
  'persons',
  {
    id: idField('person_id'),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    fullName: text('full_name').notNull(),
    phone: varchar('phone', { length: 50 }),
    address: jsonb('address').$type<{
      street: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    }>(),
    dateOfBirth: timestampWithTimezone('date_of_birth'),
    nationality: varchar('nationality', { length: 100 }),
    gender: varchar('gender', { length: 20 }),
    pictureUrl: text('picture_url'),
    createdAt: timestampWithTimezone('created_at').notNull().defaultNow(),
    updatedAt: timestampWithTimezone('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_persons_full_name').on(table.fullName),
    index('idx_persons_phone').on(table.phone),
  ],
);

export const personsRelations = relations(persons, ({ many }) => ({
  leads: many(leads),
}));

export type SelectPerson = typeof persons.$inferSelect;
export type InsertPerson = typeof persons.$inferInsert;
export type UpdatePerson = Partial<SelectPerson>;
