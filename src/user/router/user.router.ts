import { Router } from "express";
import { Container } from "typedi";
import { authenticateJWT } from "../../shared/middlewares/authentication-jwt.middleware";
import { authorizeRoles } from "../../shared/middlewares/authorize-roles.middleware";
import { UserController } from "../controller/user.controller";
import { UserRoles } from "../enums/user-roles.enum";
import { UserEndPoints } from "../enums/user-endpoints.enum";
import { createUserDtoSchema } from "../dtos/requests/create-user.dto";
import { requestDataValidator } from "../../shared/middlewares/request-data-validator.middleware";
import { responseFormatter } from "../../shared/middlewares/response-formatter.middleware";
import { mongoIdDtoSchema } from "../../shared/dtos/requests/mongo-id.dto";

const userRouter = Router();
const userController = Container.get(UserController);

// Create user endpoint
userRouter.post(
  UserEndPoints.CREATE_USER,
  authenticateJWT,
  authorizeRoles(UserRoles.SUPER_ADMIN),
  requestDataValidator({ bodySchema: createUserDtoSchema }),
  responseFormatter(userController.create.bind(userController))
);

// Find one user by ID endpoint
userRouter.get(
  UserEndPoints.FIND_ONE_USER,
  authenticateJWT,
  authorizeRoles(UserRoles.SUPER_ADMIN),
  requestDataValidator({ paramsSchema: mongoIdDtoSchema }),
  responseFormatter(userController.findOne.bind(userController))
);

export default userRouter;
