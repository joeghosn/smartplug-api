import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
  constructor(
    message: string = 'Not Found',
    data?: any,
    errorCode = 'NOT_FOUND',
  ) {
    super(404, message, data, errorCode);
  }
}
