import { HttpException } from './http.exception';

export class InternalServerErrorException extends HttpException {
  constructor(
    message: string = 'Internal Server Error',
    data?: any,
    errorCode = 'INTERNAL_SERVER_ERROR',
  ) {
    super(500, message, data, errorCode);
  }
}
