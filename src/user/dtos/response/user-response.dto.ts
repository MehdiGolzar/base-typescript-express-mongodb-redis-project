import { IUser } from "../../interfaces/user.interface";
import { BaseResponseDto } from "../../../shared/dtos/response/base-response.dto";

// Define the user response dto
export class UserResponseDto extends BaseResponseDto {
  username: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  role: string;

  constructor(data: IUser, fullDetails: boolean = false) {
    super(data, fullDetails);

    this.username = data.username;
    this.email = data?.email;
    this.phoneNumber = data?.phoneNumber;
    this.fullName = data?.fullName;
    this.role = data.role;
  }
}
