import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import configs from "../../config";
import Container from "typedi";
import { IPayload } from "../../auth/interfaces/payload.interface";
import { UserService } from "../../user/service/user.service";
import AppError from "../classes/app-error.class";
import { SharedErrorMessages } from "../enums/shared-messages.enum";
import { IRequestWithUser } from "../interfaces/request-with-user.interface";

// Middleware to authenticate JWT and attach the user to the request
export const authenticateJWT = async (
  req: Request, // Use base Request to match Express type
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract token from Authorization header ("Bearer <token>")
  const token = req.headers.authorization?.split("Bearer ")[1];

  // If no token is provided, throw an unauthorized error
  if (!token) {
    return next(
      new AppError(
        SharedErrorMessages.UNAUTHORIZED_TOKEN,
        httpStatus.UNAUTHORIZED
      )
    );
  }

  try {
    // Verify the token using the secret key
    const payload = jwt.verify(token, configs.jwt.secret) as IPayload;

    // Get the user service via TypeDI
    const userService = Container.get(UserService);

    // Fetch the user from the database using the ID from the payload
    const user = await userService.findById(payload.id);

    // If no user is found, throw unauthorized
    if (!user) {
      return next(
        new AppError(
          SharedErrorMessages.UNAUTHORIZED_TOKEN,
          httpStatus.UNAUTHORIZED
        )
      );
    }

    // Attach the user to the request object
    (req as IRequestWithUser).user = user;

    // Proceed to next middleware or route
    next();
  } catch (error) {
    // On error (e.g., token expired or invalid), throw unauthorized
    return next(
      new AppError(
        SharedErrorMessages.UNAUTHORIZED_TOKEN,
        httpStatus.UNAUTHORIZED
      )
    );
  }
};
