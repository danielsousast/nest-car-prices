import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

interface CustomRequest extends Request {
  currentUser?: User | null; 
}

// Runs as middleware (before guards) so that request.currentUser is already
// set by the time any guard needs it, unlike an interceptor which runs after guards.
@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: CustomRequest, res: Response, next: NextFunction) {
    const { userId } = (req as any).session || {};

    if (userId) {
      req.currentUser = await this.usersService.findOneById(userId);
    }

    next();
  }
}
