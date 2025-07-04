import { Schema } from "mongoose";
import autopopulate from "mongoose-autopopulate";

export default class BaseSchema<T> extends Schema<T> {
  constructor(
    definition: Record<string, any>,
    options: Record<string, any> = {}
  ) {
    super(
      {
        
        creatorId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        ...definition,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null }, // Soft delete support
      },
      { timestamps: true, versionKey: false, ...options }
    );

    // Apply autopopulate plugin
    this.plugin(autopopulate);

    // Add a virtual `id` field that returns `_id` as a string
    this.virtual("id").get(function (this: { _id: Schema.Types.ObjectId }) {
      return this._id.toString();
    });

    // Ensure virtuals are included when converting to JSON
    this.set("toJSON", { virtuals: true });
    this.set("toObject", { virtuals: true });
  }
}
