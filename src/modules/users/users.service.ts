import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
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
  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
