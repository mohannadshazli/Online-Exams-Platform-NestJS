import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // لو بعت مفتاح معين للديكوريتور (زي الإيميل مثلاً) هيرجعه هو بس
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
