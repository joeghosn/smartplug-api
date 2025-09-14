import { HttpException } from './http.exception';

export class UnprocessableContentException extends HttpException {
  constructor(
    message: string = 'Unprocessable Content',
    data?: any,
    errorCode = 'VALIDATION_FAILED',
  ) {
    super(422, message, data, errorCode);
  }
}
