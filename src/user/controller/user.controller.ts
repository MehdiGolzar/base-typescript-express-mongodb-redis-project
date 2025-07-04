import { Inject, Service } from "typedi";
import httpstatus from "http-status";
import { UserResponseDto } from "../dtos/response/user-response.dto";
import { IUser } from "../interfaces/user.interface";
import { UserService } from "../service/user.service";
import { ICreateUserDto } from "../interfaces/create-user-dto.interface";
import { UserSuccessMessages } from "../enums/user-messages.enum";
import BaseController from "../../shared/controller/base.controller";
import { IResponseData } from "../../shared/interfaces/response-data.interface";
import { IMongoIdDto } from '../../shared/dtos/requests/mongo-id.dto';

@Service()
export class UserController extends BaseController<IUser, UserResponseDto> {
  constructor(@Inject() private readonly userService: UserService) {
    super(userService);
  }

  // Create user handler
  async create(
    data: ICreateUserDto,
    requesterUser: IUser
  ): Promise<IResponseData<UserResponseDto>> {
    // Pass incoming data to service and get result
    const result: IUser = await this.userService.create(data, requesterUser);

    // Return response
    return {
      statusCode: httpstatus.CREATED,
      message: UserSuccessMessages.CREATED,
      data: new UserResponseDto(result),
    };
  }

  // Find one user by ID handler
  async findOne(data: IMongoIdDto): Promise<IResponseData<UserResponseDto>> {
    // Destructure incoming data
    const { _id } = data;

    // Pass incoming data to service and get result
    const result: IUser = await this.userService.findOne({ _id });

    // Return response
    return {
      statusCode: httpstatus.OK,
      message: UserSuccessMessages.FOUND,
      data: new UserResponseDto(result, true),
    };
  }

  async findAll(): Promise<IResponseData<IUser[]>> {
    return {};
  }

  async updateOne(): Promise<IResponseData<IUser>> {
    return {};
  }

  async softDelete(): Promise<IResponseData<IUser>> {
    return {};
  }

  async hardDelete(): Promise<IResponseData<IUser>> {
    return {};
  }
}
