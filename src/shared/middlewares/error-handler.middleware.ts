import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import AppError from "../classes/app-error.class";
import { SharedErrorMessages } from "../enums/shared-messages.enum";

// Ensure correct function signature
export const errorHandler: (
  err: any, // Accept any error type
  req: Request,
  res: Response,
  next: NextFunction
) => void = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    console.error("Unexpected Error:", err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: SharedErrorMessages.INTERNAL_SERVER_ERROR,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  if (!err.isOperational) {
    console.error("Critical Error:", err);
  }

  res.status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.isOperational
      ? err.message
      : SharedErrorMessages.INTERNAL_SERVER_ERROR,
    statusCode: err.statusCode || 500,
    data: err.data || null,
  });
};
