import _ from "lodash";
import IBaseResponseDto from "../../interfaces/base-response-dto.interface";
import IBaseDocument from "../../interfaces/base-document.interface";

export class BaseResponseDto implements IBaseResponseDto {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  creatorId?: string;

  constructor(data: IBaseDocument, fullDetails: boolean = false) {
    this.id = data.id;

    if (fullDetails) {
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
      this.deletedAt = data.deletedAt;
      this.creatorId = data?.creatorId as string;
    }
  }
}
