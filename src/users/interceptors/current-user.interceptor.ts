import { NestInterceptor, ExecutionContext, Injectable, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../users.service';

// The CurrentUserInterceptor retrieves the current user from the session and attaches it to the request object for use in controllers.
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session || {};

    if (userId) {
      request.currentUser = await this.usersService.findOneById(userId);
    }

    return next.handle();
  }
}