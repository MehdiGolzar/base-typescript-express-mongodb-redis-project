import Joi from "joi";

// Define the interface for the mongo ID DTO
export interface IMongoIdDto {
  _id: string;
}

// Define a Joi schema for validating the mongo ID
export const mongoIdDtoSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/) // Regex for a 24-character hexadecimal string
    .messages({
      "string.pattern.base": "شناسه وارد شده معتبر نمی‌باشد", // Invalid format
    }),
});
