import { Inject, Service } from "typedi";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { AuthErrorMessages } from "../enums/auth-messages.enum";
import jwt from "jsonwebtoken";
import configs from "../../config";
import { StringValue } from "ms";
import { ILoginDto } from "../interfaces/login-dto.interface";
import { ILoginResponse } from "../interfaces/login-response.interface";
import { IPayload } from "../interfaces/payload.interface";
import { ITokens } from "../interfaces/tokens.interface";
import { UserService } from "../../user/service/user.service";
import AppError from "../../shared/classes/app-error.class";

@Service()
export class AuthService {
  constructor(@Inject() private readonly userService: UserService) {}

  // JWT configs
  private jwtConfigs = configs.jwt;

  // Function to login user
  async login(data: ILoginDto): Promise<ILoginResponse> {
    // Destructure data
    let { username, password } = data;

    try {
      // Find user by username
      const userFound = await this.userService.findOne({ username });

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        userFound.password
      );

      // If password is not valid throw error
      if (!isValidPassword) {
        throw new AppError(
          AuthErrorMessages.INVALID_CREDENTIALS,
          httpStatus.UNAUTHORIZED
        );
      }

      // Generate JWT tokens
      const { access, refresh } = this.generateJWT({
        id: userFound.id,
        role: userFound.role,
      });

      // Return user and tokens
      return {
        user: userFound,
        credentials: { access, refresh },
      };
    } catch (error) {
      // If user is not found throw error
      throw new AppError(
        AuthErrorMessages.INVALID_CREDENTIALS,
        httpStatus.UNAUTHORIZED
      );
    }
  }

  // Function to generate JWT tokens ( access and refresh )
  private generateJWT = (payload: IPayload): ITokens => {
    // Destructure configs
    const { accessTtl, refreshTtl, secret } = configs.jwt;

    // Generate access token
    const accessToken = jwt.sign(payload, secret, {
      expiresIn: accessTtl as StringValue,
    });

    // Generate refresh token
    const refreshToken = jwt.sign(payload, secret, {
      expiresIn: refreshTtl as StringValue,
    });

    // Return tokens
    return {
      access: accessToken,
      refresh: refreshToken,
    };
  };
}
