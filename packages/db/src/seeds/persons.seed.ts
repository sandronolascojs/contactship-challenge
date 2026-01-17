import { Gender } from '@contactship/types';
import { faker } from '@faker-js/faker';
import { getDb } from '../index';
import { persons, type SelectPerson } from '../schema';

const PERSONS_COUNT = 10;

export const seedPersons = async () => {
  console.log('🌱 Seeding persons...');

  const db = getDb();

  try {
    const existingPersons: SelectPerson[] = await db.select().from(persons);

    if (existingPersons.length >= PERSONS_COUNT) {
      console.log(`⏭️  Persons already seeded (${existingPersons.length}), skipping`);
      return;
    }

    for (let i = 0; i < PERSONS_COUNT; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const gender = faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE, Gender.OTHER]);

      await db.insert(persons).values({
        firstName,
        lastName,
        phone: faker.phone.number({ style: 'national' }),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postcode: faker.location.zipCode(),
          country: faker.location.countryCode('alpha-2'),
        },
        dateOfBirth: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
        nationality: faker.location.countryCode('alpha-3'),
        gender,
        pictureUrl: faker.image.avatar(),
      });
    }

    console.log(`✅ Created ${PERSONS_COUNT} persons`);
  } catch (error) {
    console.error('❌ Error seeding persons:', error);
    throw error;
  }
};
