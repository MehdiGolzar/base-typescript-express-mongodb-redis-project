import { Types } from "mongoose";

export default interface IBaseResponseDto {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  creatorId?: string | Types.ObjectId;
}
