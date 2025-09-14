import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
  constructor(
    message: string = 'Bad Request',
    data?: any,
    errorCode = 'BAD_REQUEST',
  ) {
    super(400, message, data, errorCode);
  }
}
