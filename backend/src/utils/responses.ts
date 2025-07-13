import { Request, Response } from "express";

export const successResponse = (
  res: Response,
  message: string = "Success",
  status: number = 200,
  data: any = null
) => {
  res.status(status).json({
    message,
    status,
    data,
  });
};

export const errorResponse = (
  res: Response,
  error: string = "Error",
  status: number = 500,
  details: any = null
) => {
  res.status(status).json({
    error,
    status,
    details,
  });
};
