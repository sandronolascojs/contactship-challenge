import type { InsertPerson, SelectPerson } from '@contactship/db/schema';
import { Injectable } from '@nestjs/common';
import type { CreateLeadDto } from '../leads/dto';
import { PersonsRepository } from './repository/persons.repository';

@Injectable()
export class PersonsService {
  constructor(private readonly personsRepository: PersonsRepository) {}

  async createFromLeadDto(dto: CreateLeadDto): Promise<SelectPerson> {
    const fullName = `${dto.firstName} ${dto.lastName}`;

    const personData: InsertPerson = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName,
    };

    if (dto.phone) personData.phone = dto.phone;
    if (dto.address) personData.address = dto.address;
    if (dto.dateOfBirth) personData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.nationality) personData.nationality = dto.nationality;
    if (dto.gender) personData.gender = dto.gender;
    if (dto.pictureUrl) personData.pictureUrl = dto.pictureUrl;

    return this.personsRepository.create(personData);
  }

  async findOneById(id: string): Promise<SelectPerson> {
    return this.personsRepository.findOneById(id);
  }
}
