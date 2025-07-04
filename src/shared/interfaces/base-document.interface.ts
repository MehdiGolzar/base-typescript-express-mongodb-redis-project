import { Document, Types } from "mongoose";

export default interface IBaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  creatorId: string | Types.ObjectId;
}
