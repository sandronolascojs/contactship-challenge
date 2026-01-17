import { Injectable, NotFoundException } from '@nestjs/common';
import type { DB } from '@contactship/db';
import { persons, SelectPerson, InsertPerson, UpdatePerson } from '@contactship/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PersonsRepository {
  constructor(private readonly db: DB) {}

  async create(data: InsertPerson): Promise<SelectPerson> {
    const [person] = await this.db.insert(persons).values(data).returning();
    return person;
  }

  async findOneById(id: string): Promise<SelectPerson> {
    const [person] = await this.db
      .select()
      .from(persons)
      .where(eq(persons.id, id))
      .limit(1);

    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    return person;
  }

  async update(id: string, data: UpdatePerson): Promise<SelectPerson> {
    const [person] = await this.db
      .update(persons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(persons.id, id))
      .returning();

    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }

    return person;
  }
}
