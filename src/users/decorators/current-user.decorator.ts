import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// The CurrentUser decorator retrieves the current user from the request object, which is set by the CurrentUserMiddleware.
export const CurrentUser = createParamDecorator(
  (_data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);