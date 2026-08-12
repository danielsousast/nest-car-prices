import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { describe, beforeEach, it, jest, expect } from '@jest/globals';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    create: jest.MockedFunction<(entity: Partial<User>) => User>;
    find: jest.MockedFunction<(
      options?: { where?: Partial<User> },
    ) => Promise<User[]>>;
    findOne: jest.MockedFunction<
      (options: { where: Partial<User> }) => Promise<User | null>
    >;
    remove: jest.MockedFunction<(entity: User) => Promise<User>>;
    save: jest.MockedFunction<(entity: User) => Promise<User>>;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn() as jest.MockedFunction<(entity: Partial<User>) => User>,
      find: jest.fn() as jest.MockedFunction<
        (options?: { where?: Partial<User> }) => Promise<User[]>
      >,
      findOne: jest.fn() as jest.MockedFunction<
        (options: { where: Partial<User> }) => Promise<User | null>
      >,
      remove: jest.fn() as jest.MockedFunction<(entity: User) => Promise<User>>,
      save: jest.fn() as jest.MockedFunction<(entity: User) => Promise<User>>,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user when the email is available', async () => {
    const user = { id: 'user-id', name: 'Ada', email: 'ada@example.com', password: 'secret' };
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(user);
    repository.save.mockResolvedValue(user);

    await expect(service.create('Ada', 'ada@example.com', 'secret')).resolves.toEqual(user);
    expect(repository.create).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret',
    });
  });

  it('rejects an email that is already registered', async () => {
    repository.findOne.mockResolvedValue({} as User);

    await expect(service.create('Ada', 'ada@example.com', 'secret')).rejects.toThrow(
      ConflictException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('returns a user by id', async () => {
    const user = { id: 'user-id', name: 'Ada', email: 'ada@example.com', password: 'secret' };
    repository.findOne.mockResolvedValue(user);

    await expect(service.findById('user-id')).resolves.toEqual(user);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
  });

  it('throws when no user has the requested id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findById('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('returns all users', async () => {
    const users = [
      { id: 'user-1', name: 'Ada', email: 'ada@example.com', password: 'secret' },
      { id: 'user-2', name: 'Grace', email: 'grace@example.com', password: 'secret' },
    ];
    repository.find.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toEqual(users);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('returns users with the requested email', async () => {
    const users = [{ id: 'user-1', name: 'Ada', email: 'ada@example.com', password: 'secret' }];
    repository.find.mockResolvedValue(users);

    await expect(service.findByEmail('ada@example.com')).resolves.toEqual(users);
    expect(repository.find).toHaveBeenCalledWith({ where: { email: 'ada@example.com' } });
  });

  it('removes a user by id', async () => {
    const user = { id: 'user-id', name: 'Ada', email: 'ada@example.com', password: 'secret' };
    repository.findOne.mockResolvedValue(user);
    repository.remove.mockResolvedValue(user);

    await expect(service.remove('user-id')).resolves.toEqual(user);
    expect(repository.remove).toHaveBeenCalledWith(user);
  });

  it('updates a user by id', async () => {
    const user = { id: 'user-id', name: 'Ada', email: 'ada@example.com', password: 'secret' };
    repository.findOne.mockResolvedValue(user);
    repository.save.mockImplementation(async (value) => value as User);

    await expect(service.update('user-id', { name: 'Ada Lovelace' })).resolves.toEqual({
      ...user,
      name: 'Ada Lovelace',
    });
    expect(repository.save).toHaveBeenCalledWith({
      ...user,
      name: 'Ada Lovelace',
    });
  });
});
