/// <reference types="jest" />
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'create' | 'findOneByEmail'>
  >;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findOneByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of AuthService', () => {
    expect(service).toBeDefined();
  });

  it('hashes the password before saving a new user', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(
      async (name, email, password) =>
        ({ id: 'user-id', name, email, password }) as User,
    );

    const user = await service.signup('Ada', 'ada@example.com', 'password123');

    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^[a-f0-9]+\.[a-f0-9]+$/);
  });

  it('signs up a user with a normalized email and hashed password', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(
      async (name, email, password) =>
        ({ id: 'user-id', name, email, password }) as User,
    );

    const user = await service.signup('Ada', ' ADA@example.com ', 'password123');

    expect(user.email).toBe('ada@example.com');
    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^[a-f0-9]+\.[a-f0-9]+$/);
  });

  it('rejects a duplicate email during sign up', async () => {
    await service.signup('Ada', 'email@example.com', '123');
    try {
      await service.signup('Ada', 'email@example.com', '123');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
    }
  });

  it('signs in a user with valid credentials', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(
      async (name, email, password) =>
        ({ id: 'user-id', name, email, password }) as User,
    );
    const user = await service.signup('Ada', 'ada@example.com', 'password123');
    usersService.findOneByEmail.mockResolvedValue(user);

    await expect(
      service.signin('ada@example.com', 'password123'),
    ).resolves.toEqual(user);
  });

  it('normalizes the email when signing in', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(
      async (name, email, password) =>
        ({ id: 'user-id', name, email, password }) as User,
    );
    const user = await service.signup('Ada', 'ada@example.com', 'password123');
    usersService.findOneByEmail.mockResolvedValue(user);

    await service.signin(' ADA@example.com ', 'password123');

    expect(usersService.findOneByEmail).toHaveBeenLastCalledWith(
      'ada@example.com',
    );
  });

  it('rejects an incorrect password', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(
      async (name, email, password) =>
        ({ id: 'user-id', name, email, password }) as User,
    );
    const user = await service.signup('Ada', 'ada@example.com', 'password123');
    usersService.findOneByEmail.mockResolvedValue(user);

    await expect(
      service.signin('ada@example.com', 'wrong-password'),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });

  it('rejects a malformed stored password hash', async () => {
    usersService.findOneByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'Ada',
      email: 'ada@example.com',
      password: 'invalid',
    } as User);

    await expect(
      service.signin('ada@example.com', 'password123'),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });

  it('rejects invalid credentials', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);

    await expect(
      service.signin('missing@example.com', 'password123'),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });
});
