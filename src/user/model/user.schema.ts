import { model, Schema } from "mongoose";
import BaseSchema from "../../shared/model/base.schema";
import configs from "../../config";
import { IUser } from "../interfaces/user.interface";
import { UserRoles } from "../enums/user-roles.enum";

// Define the user schema
const UserSchema: Schema<IUser> = new BaseSchema<IUser>({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: false, unique: true, lowercase: true },
  phoneNumber: { type: String, required: false, unique: true },
  fullName: { type: String, required: false },
  password: { type: String, required: true },
  role: { type: String, required: true },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      // creator is only optional if both username and role match super admin
      return !(
        this.username === configs.app.superAdmin.username &&
        this.role === UserRoles.SUPER_ADMIN
      );
    },
  },
});

// Create and export the user model
export const UserModel = model<IUser>("User", UserSchema);
