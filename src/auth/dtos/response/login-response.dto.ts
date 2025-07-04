import { UserResponseDto } from "../../../user/dtos/response/user-response.dto";
import { ILoginResponse } from "../../interfaces/login-response.interface";
import { ITokens } from "../../interfaces/tokens.interface";

export class LoginResponseDto {
  user: UserResponseDto;
  credentials: ITokens;

  constructor(data: ILoginResponse) {
    this.user = new UserResponseDto(data.user);
    this.credentials = data.credentials;
  }
}
