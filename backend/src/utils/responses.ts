import { Request, Response } from "express";

export const successResponse = (
  res: Response,
  message: string = "Success",
  statusCode: number = 200,
  data: any = null
) => {
  res.status(statusCode).json({
    message,
    statusCode,
    status: "success",
    data,
  });
};

export const errorResponse = (
  res: Response,
  error: string = "Error",
  statusCode: number = 500,
  details: any = null
) => {
  res.status(statusCode).json({
    error,
    statusCode,
    status: "error",
    details,
  });
};
