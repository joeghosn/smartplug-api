export class BaseException extends Error {
  constructor(
    public readonly status: number,
    public readonly body: object,
  ) {
    super();
  }
}
