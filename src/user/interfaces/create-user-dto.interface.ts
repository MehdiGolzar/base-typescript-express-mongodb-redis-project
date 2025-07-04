// Define the interface for create user dto
export interface ICreateUserDto {
  username: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  password: string;
}
