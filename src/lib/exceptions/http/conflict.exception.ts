import { HttpException } from './http.exception';

export class ConflictException extends HttpException {
  constructor(
    message: string = 'Conflict',
    data?: any,
    errorCode = 'CONFLICT',
  ) {
    super(409, message, data, errorCode);
  }
}
