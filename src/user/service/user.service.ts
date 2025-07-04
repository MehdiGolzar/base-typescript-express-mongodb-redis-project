import { Inject, Service } from "typedi";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { FilterQuery, Types } from "mongoose";
import { UserRepository } from "../repository/user.repository";
import { IUser } from "../interfaces/user.interface";
import { ICreateUserDto } from "../interfaces/create-user-dto.interface";
import { UserRoles } from "../enums/user-roles.enum";
import { UserErrorMessages } from "../enums/user-messages.enum";
import BaseService from "../../shared/service/base.service";
import AppError from "../../shared/classes/app-error.class";
import { Logger } from "winston";
import { getLogger } from "../../shared/logger/winston.logger";

@Service()
export class UserService extends BaseService<IUser> {
  private readonly logger: Logger = getLogger(UserService.name);

  constructor(@Inject() private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  // Function to create user
  async create(data: ICreateUserDto, requester: IUser): Promise<IUser> {
    // Destructure data
    let { username, password, email, phoneNumber } = data;

    // Check username duplicate and if exists throw error
    await this.checkUsernameDuplicate(username);

    // Check email duplicate and if exists throw error
    if (email) {
      await this.checkEmailDuplicate(email);
    }

    // Check phone number duplicate and if exists throw error
    if (phoneNumber) {
      await this.checkPhoneNumberDuplicate(phoneNumber);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user data
    const dataToCreate: Partial<IUser> = {
      ...data,
      password: hashedPassword,
      role: UserRoles.User,
      creatorId: new Types.ObjectId(requester.id),
    };

    // Create user and return
    return await this.userRepository.create(dataToCreate);
  }

  async findOne(data: FilterQuery<IUser>): Promise<IUser> {
    const userFound = await this.userRepository.findOne(data);

    if (!userFound) {
      throw new AppError(UserErrorMessages.NOT_FOUND, httpStatus.NOT_FOUND, {
        id: data._id.toString(),
      });
    }

    return userFound;
  }

  async findAll(): Promise<IUser[]> {
    return await this.userRepository.findAll({});
  }

  async updateOne(): Promise<IUser | null> {
    return await this.userRepository.updateOne({}, {});
  }

  async softDelete(): Promise<IUser | null> {
    return await this.userRepository.softDelete({});
  }

  async hardDelete(): Promise<IUser | null> {
    return await this.userRepository.hardDelete({});
  }

  // Function to check if a username already exists
  private async checkUsernameDuplicate(username: string): Promise<void> {
    // Check if username already exists
    const isUsernameExists = await this.userRepository.findOne({
      username,
    });

    // If username exists throw error
    if (isUsernameExists) {
      throw new AppError(
        UserErrorMessages.CONFLICT_USERNAME,
        httpStatus.CONFLICT,
        { username }
      );
    }

    return;
  }

  // Function to check if a email already exists
  private async checkEmailDuplicate(email: string): Promise<void> {
    // Check if email already exists
    const isEmailExists = await this.userRepository.findOne({
      email,
    });

    // If email exists throw error
    if (isEmailExists) {
      throw new AppError(
        UserErrorMessages.CONFLICT_EMAIL,
        httpStatus.CONFLICT,
        { email }
      );
    }

    return;
  }

  // Function to check if a phone number already exists
  private async checkPhoneNumberDuplicate(phoneNumber: string): Promise<void> {
    // Check if phone number already exists
    const isPhoneNumberExists = await this.userRepository.findOne({
      phoneNumber,
    });

    // If phone number exists throw error
    if (isPhoneNumberExists) {
      throw new AppError(
        UserErrorMessages.CONFLICT_PHONE_NUMBER,
        httpStatus.CONFLICT,
        { phoneNumber }
      );
    }

    return;
  }

  // Function to hash password
  private hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10; // Number of hashing rounds (recommended: 10-12)

    // Hash password
    return await bcrypt.hash(password, saltRounds);
  };

  // Function to find user by id for use in other services
  async findById(userId: string): Promise<IUser | null> {
    return this.userRepository.findOne({ _id: new Types.ObjectId(userId) });
  }
}
