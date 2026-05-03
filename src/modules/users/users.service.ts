import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { hash } from '../../common/utils/bcrypt.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async create(dto: CreateUserDto | RegisterDto) {
    try {
      dto.password = await hash(dto.password);
      const { role, password, passwordConfirm, hashed_refresh_token, ...user } =
        await this.usersRepository.save(dto);
      return { message: 'User created successfully', user };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Failed to create user', errorMessage);
    }
  }

  public findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.usersRepository, {
      sortableColumns: ['id', 'first_name', 'last_name', 'email'],
      nullSort: 'last',
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['first_name', 'last_name', 'email'],
      select: ['id', 'first_name', 'last_name', 'email'],
      filterableColumns: {
        id: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
        first_name: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
        last_name: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
        email: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
      },
    });
  }
  //http://localhost:3000/users?page=1&limit=100&sortBy=id:ASC&filter.email=$ilike:daz
  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { passwordConfirm, ...updateData } = updateUserDto;
    const result = await this.usersRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return 'User updated successfully';
  }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return 'User deleted successfully';
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    if (!refreshToken) {
      await this.usersRepository.update(userId, {
        hashed_refresh_token: null,
      });
      return;
    }
    const hashed = await bcrypt.hash(refreshToken, 10);

    await this.usersRepository.update(userId, {
      hashed_refresh_token: hashed,
    });
  }
}
