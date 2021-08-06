import { Request, Response, NextFunction } from "express";
import L from "../../common/logger";

export default function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const errors = err.errors || [{ message: err.message }];
  L.error('error caught')
  L.error(err);
  res.status(err.status || 500).json({ errors });
}
