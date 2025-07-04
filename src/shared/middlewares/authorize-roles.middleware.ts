import { Response, NextFunction, RequestHandler } from "express";
import httpStatus from "http-status";
import { UserRoles } from "../../user/enums/user-roles.enum";
import { IRequestWithUser } from "../interfaces/request-with-user.interface";
import AppError from "../classes/app-error.class";
import { SharedErrorMessages } from "../enums/shared-messages.enum";

/**
 * Middleware to restrict access based on user roles.
 * Only allows users with roles included in `allowedRoles`.
 *
 * @param allowedRoles - A list of roles permitted to access the route
 * @returns Express middleware function
 */
export const authorizeRoles = (
  ...allowedRoles: UserRoles[]
): RequestHandler => {
  return (req: any, res: Response, next: NextFunction): void => {
    const requestWithUser = req as IRequestWithUser;

    // Ensure the user is authenticated and has a role
    if (!requestWithUser.user || !requestWithUser.user.role) {
      return next(
        new AppError(
          SharedErrorMessages.UNAUTHORIZED_TOKEN,
          httpStatus.UNAUTHORIZED
        )
      );
    }

    // Check if the user's role is among the allowed roles
    if (!allowedRoles.includes(requestWithUser.user.role as UserRoles)) {
      return next(
        new AppError(SharedErrorMessages.FORBIDDEN, httpStatus.FORBIDDEN)
      );
    }

    next(); // Authorized, proceed to the next middleware
  };
};
