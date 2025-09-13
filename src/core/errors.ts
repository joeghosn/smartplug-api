export class AppError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.status = status;
    if (code !== undefined) {
      this.code = code;
    }
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", code?: string) {
    super(message, 400, code);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not Found", code?: string) {
    super(message, 404, code);
  }
}
export class ConflictError extends AppError {
  constructor(message = "Conflict", code?: string) {
    super(message, 409, code);
  }
}
