import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { User } from './user.entity';
import { UsersService } from './users.service';

const scrypt = promisify(nodeScrypt);
const SCRYPT_KEY_LENGTH = 64;

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  // Creates a user after normalizing their email and hashing their password.
  async signup(name: string, email: string, password: string): Promise<User> {
    // Normalization prevents the same email from being registered with
    // different casing or accidental surrounding spaces.
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.usersService.findOneByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await this.getEncryptedPassword(password);

    // Store both values together so the salt is available during sign-in.
    // The plaintext password is never persisted.
    return this.usersService.create(
      name,
      normalizedEmail,
      passwordHash,
    );
  }

  async getEncryptedPassword(password: string): Promise<string> {
    // Generate a unique random salt so identical passwords do not produce the
    // same stored value for different users.
    const salt = randomBytes(16).toString('hex');

    // Scrypt derives a one-way, 64-byte password hash. Despite this method's
    // name, the password is hashed and cannot be decrypted later.
    const hash = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;

    // Store the salt with the hexadecimal hash. verifyPassword uses this salt
    // to hash a submitted password and compare the two results.
    return `${salt}.${hash.toString('hex')}`;
  }

  // Verifies the supplied credentials and returns the authenticated user.
  async signin(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(
      email.trim().toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!(await this.verifyPassword(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  // Password hashes are irreversible, so authentication recomputes the hash
  // with the stored salt and compares the result instead of decrypting it.
  private async verifyPassword(
    suppliedPassword: string,
    savedPassword: string,
  ): Promise<boolean> {
    // Passwords are stored in the format "salt.hash".
    const [salt, storedHash] = savedPassword.split('.');
    if (!salt || !storedHash) {
      return false;
    }

    const suppliedHash = (await scrypt(
      suppliedPassword,
      salt,
      SCRYPT_KEY_LENGTH,
    )) as Buffer;
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    // timingSafeEqual avoids leaking useful timing information to attackers.
    // It requires equal-sized buffers, so their lengths are checked first.
    return (
      storedHashBuffer.length === suppliedHash.length &&
      timingSafeEqual(storedHashBuffer, suppliedHash)
    );
  }
}
