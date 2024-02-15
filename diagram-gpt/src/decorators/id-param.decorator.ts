import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as uuid from 'uuid';

export const IdParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.params.id;

    if (!uuid.validate(id)) {
      throw new Error('Invalid ID');
    }

    return id;
  },
);
