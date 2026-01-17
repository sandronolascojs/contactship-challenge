import type { DB } from '@contactship/db';
import { InsertLead, leads, persons, SelectLead, UpdateLead } from '@contactship/db/schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, or, sql, SQL } from 'drizzle-orm';

export interface FindLeadsOptions {
  skip?: number;
  take?: number;
  status?: string;
  search?: string;
}

export interface FindLeadsResult {
  leads: (SelectLead & { person?: typeof persons.$inferSelect })[];
  total: number;
}

@Injectable()
export class LeadsRepository {
  constructor(private readonly db: DB) {}

  async create(data: InsertLead): Promise<SelectLead> {
    const [lead] = await this.db.insert(leads).values(data).returning();
    return lead;
  }

  async findOneById(id: string): Promise<SelectLead & { person?: typeof persons.$inferSelect }> {
    const [lead] = await this.db
      .select({
        lead: leads,
        person: persons,
      })
      .from(leads)
      .innerJoin(persons, eq(leads.personId, persons.id))
      .where(eq(leads.id, id))
      .limit(1);

    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return {
      ...lead.lead,
      person: lead.person,
    };
  }

  async findOneByEmail(email: string): Promise<SelectLead | undefined> {
    const [lead] = await this.db.select().from(leads).where(eq(leads.email, email)).limit(1);

    return lead;
  }

  async findOneByExternalId(externalId: string): Promise<SelectLead | undefined> {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(eq(leads.externalId, externalId))
      .limit(1);

    return lead;
  }

  async findMany(options: FindLeadsOptions = {}): Promise<FindLeadsResult> {
    const { skip = 0, take = 10, status, search } = options;

    const conditions: SQL[] = [];

    if (status) {
      conditions.push(sql`${leads.status} = ${status}`);
    }

    if (search) {
      const searchCondition = or(
        sql`${persons.firstName} LIKE ${`%${search}%`}`,
        sql`${persons.lastName} LIKE ${`%${search}%`}`,
        sql`${leads.email} LIKE ${`%${search}%`}`,
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = this.db
      .select({
        lead: leads,
        person: persons,
      })
      .from(leads)
      .innerJoin(persons, eq(leads.personId, persons.id));

    const result = whereClause
      ? await baseQuery.where(whereClause).orderBy(desc(leads.createdAt)).limit(take).offset(skip)
      : await baseQuery.orderBy(desc(leads.createdAt)).limit(take).offset(skip);

    const leadsWithPerson = result.map((r) => ({
      ...r.lead,
      person: r.person,
    }));

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .innerJoin(persons, eq(leads.personId, persons.id))
      .where(whereClause || sql`1=1`);

    const total = countResult?.count ?? 0;

    return {
      leads: leadsWithPerson,
      total,
    };
  }

  async update(id: string, data: UpdateLead): Promise<SelectLead> {
    const [lead] = await this.db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();

    if (lead === undefined) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return lead;
  }

  async delete(id: string): Promise<SelectLead> {
    const [lead] = await this.db.delete(leads).where(eq(leads.id, id)).returning();

    if (lead === undefined) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return lead;
  }

  async count(): Promise<number> {
    const result = await this.db.select().from(leads);
    return result.length;
  }

  async countByStatus(status: string): Promise<number> {
    const result = await this.db
      .select()
      .from(leads)
      .where(sql`${leads.status} = ${status}`);

    return result.length;
  }
}
