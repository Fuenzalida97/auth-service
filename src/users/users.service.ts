import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { Role } from './enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
}
