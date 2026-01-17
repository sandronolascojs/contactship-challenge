import { LeadSource, LeadStatus } from '@contactship/types';
import { faker } from '@faker-js/faker';
import { getDb } from '../index';
import { leads, persons, type SelectLead, type SelectPerson } from '../schema';

const LEADS_COUNT = 100;

export const seedLeads = async () => {
  console.log('🌱 Seeding leads...');

  const db = getDb();

  try {
    const existingLeads: SelectLead[] = await db.select().from(leads);

    if (existingLeads.length >= LEADS_COUNT) {
      console.log(`⏭️  Leads already seeded (${existingLeads.length}), skipping`);
      return;
    }

    const allPersons: SelectPerson[] = await db.select().from(persons);

    if (allPersons.length === 0) {
      console.log('⚠️  No persons found. Please seed persons first.');
      return;
    }

    for (let i = 0; i < LEADS_COUNT; i++) {
      const person: SelectPerson = faker.helpers.arrayElement(allPersons);
      const source = faker.helpers.arrayElement([LeadSource.MANUAL, LeadSource.EXTERNAL_API]);
      const status = faker.helpers.arrayElement([
        LeadStatus.NEW,
        LeadStatus.CONTACTED,
        LeadStatus.QUALIFIED,
        LeadStatus.CONVERTED,
        LeadStatus.LOST,
      ]);

      const hasExternalId = source === LeadSource.EXTERNAL_API;

      await db.insert(leads).values({
        personId: person.id,
        email: faker.internet.email({
          firstName: person.firstName,
          lastName: person.lastName,
        }),
        externalId: hasExternalId ? faker.string.uuid() : undefined,
        source,
        status,
        syncedAt: source === LeadSource.EXTERNAL_API ? faker.date.recent({ days: 7 }) : undefined,
        summary: faker.helpers.maybe(() => faker.lorem.paragraph()),
        nextAction: faker.helpers.maybe(() => faker.lorem.sentence()),
        summaryGeneratedAt: faker.helpers.maybe(() => faker.date.recent({ days: 7 })),
        metadata: faker.helpers.maybe(() => ({
          source: source,
          campaign: faker.helpers.maybe(() => faker.company.buzzPhrase()),
          notes: faker.helpers.maybe(() => faker.lorem.sentences(2)),
        })),
      });
    }

    console.log(`✅ Created ${LEADS_COUNT} leads`);
  } catch (error) {
    console.error('❌ Error seeding leads:', error);
    throw error;
  }
};
