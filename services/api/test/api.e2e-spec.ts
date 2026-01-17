import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let leadId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /auth/login - should authenticate user and return JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@contactship.com',
          password: 'admin123',
        })
        .expect(200);

      interface LoginResponse {
        access_token: string;
      }

      const body = response.body as LoginResponse;
      expect(body).toHaveProperty('access_token');
      expect(typeof body.access_token).toBe('string');
      authToken = body.access_token;
    });

    it('POST /auth/login - should fail with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@contactship.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Leads - Create', () => {
    it('POST /leads - should create a new lead with valid data', async () => {
      const timestamp = Date.now();
      const createLeadDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${timestamp}@example.com`,
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postcode: '10001',
          country: 'United States',
        },
        dateOfBirth: '1990-01-01',
        nationality: 'US',
        gender: 'male',
        source: 'manual',
        status: 'new',
        metadata: {
          referral: 'friend',
          campaign: 'spring-sale',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createLeadDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('personId');
      expect((response.body as { email: string }).email).toBe(createLeadDto.email);
      expect((response.body as { source: string }).source).toBe(createLeadDto.source);
      expect((response.body as { status: string }).status).toBe(createLeadDto.status);
      expect((response.body as { metadata: Record<string, unknown> }).metadata).toEqual(
        createLeadDto.metadata,
      );

      leadId = (response.body as { id: string }).id;
    });

    it('POST /leads - should create a lead with minimal required fields', async () => {
      const timestamp = Date.now();
      const createLeadDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: `jane.smith.${timestamp}@example.com`,
      };

      const response = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createLeadDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('personId');
      expect((response.body as { email: string }).email).toBe(createLeadDto.email);
    });

    it('POST /leads - should fail without authentication', async () => {
      const timestamp = Date.now();
      const createLeadDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${timestamp}@example.com`,
      };

      await request(app.getHttpServer()).post('/leads').send(createLeadDto).expect(401);
    });

    it('POST /leads - should fail when email already exists', async () => {
      const createLeadDto = {
        firstName: 'John',
        lastName: 'Duplicate',
        email: `john.doe.${Date.now()}@example.com`,
      };

      const response = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createLeadDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Duplicate2',
          email: (response.body as { email: string }).email,
        })
        .expect(409);
    });
  });

  describe('Leads - Summarize', () => {
    it('POST /leads/:id/summarize - should generate and save summary for existing lead', async () => {
      const response = await request(app.getHttpServer())
        .post(`/leads/${leadId}/summarize`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('summary');
      expect(typeof (response.body as { summary: string }).summary).toBe('string');
      expect((response.body as { summary: string }).summary.length).toBeGreaterThan(0);
    });

    it('POST /leads/:id/summarize - should fail for non-existent lead', async () => {
      const nonExistentId = 'clh00000000000000000000';

      await request(app.getHttpServer())
        .post(`/leads/${nonExistentId}/summarize`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('POST /leads/:id/summarize - should fail without authentication', async () => {
      await request(app.getHttpServer()).post(`/leads/${leadId}/summarize`).expect(401);
    });
  });

  describe('Leads - Read', () => {
    it('GET /leads - should retrieve all leads', async () => {
      const response = await request(app.getHttpServer())
        .get('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray((response.body as { data: unknown[] }).data)).toBe(true);
      expect(response.body).toHaveProperty('meta');
      expect((response.body as { meta: { total: number } }).meta).toHaveProperty('total');
      expect((response.body as { meta: { page: number } }).meta).toHaveProperty('page');
      expect((response.body as { meta: { take: number } }).meta).toHaveProperty('take');
    });

    it('GET /leads - should retrieve leads with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/leads?page=1&take=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect((response.body as { meta: { page: number } }).meta.page).toBe(1);
      expect((response.body as { meta: { take: number } }).meta.take).toBe(5);
      expect(Array.isArray((response.body as { data: unknown[] }).data)).toBe(true);
    });

    it('GET /leads - should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/leads').expect(401);
    });

    it('GET /leads/:id - should retrieve a lead by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', leadId);
      expect(response.body).toHaveProperty('person');
      expect((response.body as { person: { firstName: string } }).person).toHaveProperty(
        'firstName',
      );
      expect((response.body as { person: { lastName: string } }).person).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('email');
    });

    it('GET /leads/:id - should fail for non-existent lead', async () => {
      const nonExistentId = 'clh00000000000000000000';

      await request(app.getHttpServer())
        .get(`/leads/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('GET /leads/:id - should fail without authentication', async () => {
      await request(app.getHttpServer()).get(`/leads/${leadId}`).expect(401);
    });
  });

  describe('Leads - Update', () => {
    it('PATCH /leads/:id - should update a lead', async () => {
      const updateData = {
        status: 'contacted',
      };

      const response = await request(app.getHttpServer())
        .patch(`/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect((response.body as { email: string }).email).toBeDefined();
    });

    it('PATCH /leads/:id - should fail for non-existent lead', async () => {
      const nonExistentId = 'clh00000000000000000000';
      const updateData = { status: 'contacted' };

      await request(app.getHttpServer())
        .patch(`/leads/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('PATCH /leads/:id - should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/leads/${leadId}`)
        .send({ status: 'contacted' })
        .expect(401);
    });
  });

  describe('Leads - Delete', () => {
    it('DELETE /leads/:id - should delete a lead', async () => {
      await request(app.getHttpServer())
        .delete(`/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('DELETE /leads/:id - should verify deleted lead no longer exists', async () => {
      await request(app.getHttpServer())
        .get(`/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('DELETE /leads/:id - should fail for non-existent lead', async () => {
      const nonExistentId = 'clh00000000000000000000';

      await request(app.getHttpServer())
        .delete(`/leads/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('DELETE /leads/:id - should fail without authentication', async () => {
      await request(app.getHttpServer()).delete(`/leads/${leadId}`).expect(401);
    });
  });
});
