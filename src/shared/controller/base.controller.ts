import IBaseController from "../interfaces/base-controller.interface";
import IBaseDocument from "../interfaces/base-document.interface";
import IBaseResponseDto from "../interfaces/base-response-dto.interface";
import IBaseService from "../interfaces/base-service.interface";
import { IResponseData } from "../interfaces/response-data.interface";

export default class BaseController<
  T extends IBaseDocument,
  TResponseDto extends IBaseResponseDto
> implements IBaseController<T, TResponseDto>
{
  constructor(protected readonly service: IBaseService<T>) {}

  async create(...args: any): Promise<IResponseData<T | TResponseDto | any>> {
    return { success: false, message: "Create method not implemented.", data: null };
  }

  async findOne(...args: any): Promise<IResponseData<T | TResponseDto>> {
    return { success: false, message: "FindOne method not implemented.", data: null };
  }

  async findAll(...args: any): Promise<IResponseData<T[] | TResponseDto[]>> {
    return { success: false, message: "FindAll method not implemented.", data: [] };
  }

  async updateOne(...args: any): Promise<IResponseData<T | TResponseDto>> {
    return { success: false, message: "UpdateOne method not implemented.", data: null };
  }

  async softDelete(...args: any): Promise<IResponseData<T | TResponseDto | null>> {
    return { success: false, message: "SoftDelete method not implemented.", data: null };
  }

  async hardDelete(...args: any): Promise<IResponseData<T | TResponseDto | null>> {
    return { success: false, message: "HardDelete method not implemented.", data: null };
  }
}
