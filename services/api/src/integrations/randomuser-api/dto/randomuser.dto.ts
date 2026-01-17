import { z } from 'zod';

export const RandomUserSchema = z.object({
  email: z.string(),
  phone: z.string(),
  name: z.object({
    first: z.string(),
    last: z.string(),
  }),
  location: z.object({
    street: z.object({
      number: z.number(),
      name: z.string(),
    }),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string(),
  }),
  picture: z.object({
    medium: z.string(),
  }),
  dob: z.object({
    date: z.string(),
  }),
  login: z.object({
    uuid: z.string(),
  }),
  gender: z.string(),
  nat: z.string(),
});

export type RandomUser = z.infer<typeof RandomUserSchema>;

export const RandomUserApiResponseSchema = z.object({
  results: z.array(RandomUserSchema),
});

export type RandomUserApiResponse = z.infer<typeof RandomUserApiResponseSchema>;
