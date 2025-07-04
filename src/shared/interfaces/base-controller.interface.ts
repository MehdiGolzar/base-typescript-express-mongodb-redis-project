import IBaseDocument from "./base-document.interface";
import IBaseResponseDto from "./base-response-dto.interface";
import { IResponseData } from "./response-data.interface";

export default interface IBaseController<
  Document extends IBaseDocument,
  DocumentResponseDto extends IBaseResponseDto
> {
  create(...args: any): Promise<IResponseData<Document | DocumentResponseDto>>;
  findOne(...args: any): Promise<IResponseData<Document | DocumentResponseDto>>;
  findAll(
    ...args: any
  ): Promise<IResponseData<Document[] | DocumentResponseDto[]>>;
  updateOne(
    ...args: any
  ): Promise<IResponseData<Document | DocumentResponseDto>>;
  softDelete(
    ...args: any
  ): Promise<IResponseData<Document | DocumentResponseDto | null>>;
  hardDelete(
    ...args: any
  ): Promise<IResponseData<Document | DocumentResponseDto | null>>;
}
