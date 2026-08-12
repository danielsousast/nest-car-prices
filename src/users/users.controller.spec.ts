import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { describe, beforeEach, it, jest, expect } from '@jest/globals';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let module: TestingModule;
  let authService: {
    signup: jest.Mock<(...args: [string, string, string]) => Promise<User>>;
    signin: jest.Mock<(...args: [string, string]) => Promise<User>>;
  };
  let usersService: {
    create: jest.Mock<(...args: [string, string]) => Promise<User>>;
    findAll: jest.Mock<() => Promise<User[]>>;
    findByEmail: jest.Mock<(...args: [string]) => Promise<User[]>>;
    findById: jest.Mock<(...args: [string]) => Promise<User>>;
    remove: jest.Mock<(...args: [string]) => Promise<User>>;
    update: jest.Mock<
      (...args: [string, Partial<User>]) => Promise<User>
    >;
  };

  beforeEach(async () => {
    authService = {
      signup: jest.fn<(...args: [string, string, string]) => Promise<User>>(),
      signin: jest.fn<(...args: [string, string]) => Promise<User>>(),
    };
    usersService = {
      create: jest.fn<(...args: [string, string]) => Promise<User>>(),
      findAll: jest.fn<() => Promise<User[]>>(),
      findByEmail: jest.fn<(...args: [string]) => Promise<User[]>>(),
      findById: jest.fn<(...args: [string]) => Promise<User>>(),
      remove: jest.fn<(...args: [string]) => Promise<User>>(),
      update: jest.fn<(...args: [string, Partial<User>]) => Promise<User>>(),
    };

    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('signs up a user and stores their id in the session', async () => {
    const user = { id: 'user-id', name: 'Ada' } as User;
    const body = {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
    };
    const session: { userId?: string } = {};
    authService.signup.mockResolvedValue(user);

    await expect(controller.signup(body, session)).resolves.toBe(user);

    expect(authService.signup).toHaveBeenCalledWith(
      body.name,
      body.email,
      body.password,
    );
    expect(session.userId).toBe(user.id);
  });

  it('does not update the session when sign up fails', async () => {
    const error = new Error('Sign up failed');
    const session: { userId?: string } = {};
    authService.signup.mockRejectedValue(error);

    await expect(
      controller.signup(
        {
          name: 'Ada',
          email: 'ada@example.com',
          password: 'password123',
        },
        session,
      ),
    ).rejects.toBe(error);
    expect(session.userId).toBeUndefined();
  });

  it('signs in a user and stores their id in the session', async () => {
    const user = { id: 'user-id', name: 'Ada' } as User;
    const body = { email: 'ada@example.com', password: 'password123' };
    const session: { userId?: string } = {};
    authService.signin.mockResolvedValue(user);

    await expect(controller.signin(body, session)).resolves.toBe(user);

    expect(authService.signin).toHaveBeenCalledWith(body.email, body.password);
    expect(session.userId).toBe(user.id);
  });

  it('does not update the session when sign in fails', async () => {
    const error = new Error('Sign in failed');
    const session: { userId?: string } = {};
    authService.signin.mockRejectedValue(error);

    await expect(
      controller.signin(
        { email: 'ada@example.com', password: 'wrong-password' },
        session,
      ),
    ).rejects.toBe(error);
    expect(session.userId).toBeUndefined();
  });

  it('signs out the current user', () => {
    const session: { userId: string | null } = { userId: 'user-id' };

    controller.signout(session);

    expect(session.userId).toBeNull();
  });

  it('returns all users when no email is provided', async () => {
    const users = [{ id: 'user-id' }] as User[];
    usersService.findAll.mockResolvedValue(users);

    await expect(controller.findAll()).resolves.toBe(users);
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
    expect(usersService.findByEmail).not.toHaveBeenCalled();
  });

  it('finds users by email when an email is provided', async () => {
    const users = [{ id: 'user-id' }] as User[];
    usersService.findByEmail.mockResolvedValue(users);

    await expect(controller.findAll('ada@example.com')).resolves.toBe(users);
    expect(usersService.findByEmail).toHaveBeenCalledWith('ada@example.com');
    expect(usersService.findAll).not.toHaveBeenCalled();
  });

  it('returns the current user', () => {
    const user = { id: 'user-id' } as User;

    expect(controller.me(user)).toBe(user);
  });

  it('finds a user by id', async () => {
    const user = { id: 'user-id' } as User;
    usersService.findById.mockResolvedValue(user);

    await expect(controller.findById('user-id')).resolves.toBe(user);
    expect(usersService.findById).toHaveBeenCalledWith('user-id');
  });

  it('removes a user by id', async () => {
    const user = { id: 'user-id' } as User;
    usersService.remove.mockResolvedValue(user);

    await expect(controller.remove('user-id')).resolves.toBe(user);
    expect(usersService.remove).toHaveBeenCalledWith('user-id');
  });

  it('updates a user by id', async () => {
    const changes = { name: 'Grace' };
    const user = { id: 'user-id', ...changes } as User;
    usersService.update.mockResolvedValue(user);

    await expect(controller.update('user-id', changes)).resolves.toBe(user);
    expect(usersService.update).toHaveBeenCalledWith('user-id', changes);
  });
});
