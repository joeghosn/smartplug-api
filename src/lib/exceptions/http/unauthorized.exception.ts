import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(
    message: string = 'Unauthorized',
    data?: any,
    reAuth = false,
    errorCode = 'UNAUTHORIZED',
  ) {
    super(401, message, data, errorCode, reAuth);
  }
}
