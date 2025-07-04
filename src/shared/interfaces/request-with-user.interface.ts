import { Request } from "express";
import { IUser } from '../../user/interfaces/user.interface';

export interface IRequestWithUser extends Request {
  user: IUser;
}
