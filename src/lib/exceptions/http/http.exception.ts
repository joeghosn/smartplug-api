import { BaseException } from '../base.exception';

export class HttpException extends BaseException {
  public data: any;
  public errorCode?: string;

  constructor(
    status: number,
    message = 'Something went wrong',
    data: any = null,
    errorCode?: string,
    reAuth = false,
  ) {
    super(status, { statusCode: status, message, data, errorCode, reAuth });
  }
}
