import { Types } from "mongoose";
import IBaseDocument from "../../shared/interfaces/base-document.interface";

// Define the user interface
export interface IUser extends IBaseDocument {
  username: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  password: string;
  role: string;
}
