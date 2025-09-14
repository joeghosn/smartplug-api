import type { NextFunction, Request, Response } from "express";
import { BaseException } from "../exceptions/base.exception";

const error = (
  err: BaseException | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const response: Record<"status" | "body", any> = {
    status: 500,
    body: {},
  };

  if (err instanceof BaseException) {
    response.status = err.status;
    response.body = err.body;
  }

  res.status(response.status).json(response.body);
};

export default error;
