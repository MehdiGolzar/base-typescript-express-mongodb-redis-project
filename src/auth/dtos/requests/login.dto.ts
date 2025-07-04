import Joi from "joi";

// Define the schema for create user DTO
export const loginDtoSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(16)
    .pattern(/^[a-z0-9_]+$/) // Allow only lowercase letters, numbers, and underscores
    .lowercase()
    .required(),

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
