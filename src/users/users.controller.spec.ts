import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { describe, beforeEach, it, jest, expect } from '@jest/globals';

describe('UsersController', () => {
  let controller: UsersController;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            signin: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
})
