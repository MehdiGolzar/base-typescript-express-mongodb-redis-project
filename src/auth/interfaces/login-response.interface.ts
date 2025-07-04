import { IUser } from "../../user/interfaces/user.interface";
import { ITokens } from "./tokens.interface";

export interface ILoginResponse {
  user: IUser;
  credentials: ITokens;
}
