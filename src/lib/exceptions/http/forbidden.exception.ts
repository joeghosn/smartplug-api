import { HttpException } from './http.exception';

export class ForbiddenException extends HttpException {
  constructor(
    message: string = 'Forbidden',
    data?: any,
    errorCode = 'FORBIDDEN',
  ) {
    super(403, message, data, errorCode);
  }
}
