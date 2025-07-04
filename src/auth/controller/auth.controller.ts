import { Inject, Service } from "typedi";
import httpstatus from "http-status";
import { AuthService } from "../service/auth.service";
import { LoginResponseDto } from "../dtos/response/login-response.dto";
import { ILoginDto } from "../interfaces/login-dto.interface";
import { ILoginResponse } from "../interfaces/login-response.interface";
import { AuthSuccessMessages } from "../enums/auth-messages.enum";
import { IUser } from "../../user/interfaces/user.interface";
import { UserResponseDto } from "../../user/dtos/response/user-response.dto";
import { IResponseData } from "../../shared/interfaces/response-data.interface";

@Service()
export class AuthController {
  constructor(@Inject() private readonly authService: AuthService) {}

  // Login handler
  async login(data: ILoginDto): Promise<IResponseData<LoginResponseDto>> {
    // Pass incoming data to service and get result
    const result: ILoginResponse = await this.authService.login(data);

    // Return response
    return {
      statusCode: httpstatus.OK,
      message: AuthSuccessMessages.LOGGEDIN,
      data: new LoginResponseDto(result),
    };
  }

  // Get-User-INfo handler
  async whoAmI(
    _data: {},
    requesterUser: IUser
  ): Promise<IResponseData<UserResponseDto>> {
    // Return response
    return {
      statusCode: httpstatus.OK,
      data: new UserResponseDto(requesterUser),
    };
  }
}
