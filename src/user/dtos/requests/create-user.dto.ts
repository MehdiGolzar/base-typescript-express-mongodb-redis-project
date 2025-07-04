import Joi from "joi";
import { objectIdPattern } from "../../../shared/constants/mongo-object-id-pattern.constant";

// Define the schema for create user DTO
export const createUserDtoSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(16)
    .pattern(/^[a-z0-9_]+$/) // Allow only lowercase letters, numbers, and underscores
    .lowercase()
    .required(),

  email: Joi.string().email().lowercase().optional(),

  phoneNumber: Joi.string()
    .pattern(/^(?:\+98|0)?9\d{9}$/) // Accepts "+989123456789" or "09123456789"
    .optional()
    .custom((value, helpers) => {
      // Convert "+989123456789" → "09123456789"
      if (value.startsWith("+98")) {
        return "0" + value.substring(3);
      }
      return value; // Keep as is if already in "09*********"
    }),

  fullName: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/) // Only letters and spaces allowed
    .trim()
    .optional(),

  password: Joi.string()
    .min(8)
    .max(32) // Increase max length for security
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({
      password:
        "Password must contain at least one uppercase letter, one number, and one special character.",
    }),
});
