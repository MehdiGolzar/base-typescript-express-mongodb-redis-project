import { Router } from "express";
import { Container } from "typedi";
import { AuthController } from "../controller/auth.controller";
import { AuthEndPoints } from "../enums/auth-endpoints.enum";
import { loginDtoSchema } from "../dtos/requests/login.dto";
import { authenticateJWT } from "../../shared/middlewares/authentication-jwt.middleware";
import { requestDataValidator } from "../../shared/middlewares/request-data-validator.middleware";
import { responseFormatter } from "../../shared/middlewares/response-formatter.middleware";

const authRouter = Router();
const authController = Container.get(AuthController);

// Login endpoint
authRouter.post(
  AuthEndPoints.LOGIN,
  requestDataValidator({ bodySchema: loginDtoSchema }),
  responseFormatter(authController.login.bind(authController))
);

// Login endpoint
authRouter.get(
  AuthEndPoints.WHO_AM_I,
  authenticateJWT,
  responseFormatter(authController.whoAmI.bind(authController))
);

export default authRouter;
