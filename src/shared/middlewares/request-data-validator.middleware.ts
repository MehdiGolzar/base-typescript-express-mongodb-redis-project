import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import httpStatus from "http-status";
import AppError from "../classes/app-error.class";
import { SharedErrorMessages } from "../enums/shared-messages.enum";

// Function to pick only the defined fields from the request body
const filterRequestData = (
  data: Record<string, any>,
  schema: ObjectSchema
): Record<string, any> => {
  const validKeys = Object.keys(schema.describe().keys); // Get the keys from the schema
  const filteredData: Record<string, any> = {};

  // Only pick the valid keys from the request data that are defined in the schema
  for (const key of validKeys) {
    if (data[key] !== undefined) {
      filteredData[key] = data[key];
    }
  }

  return filteredData;
};

// Function to validate and filter request data
const validateData = (
  data: Record<string, any>,
  schema: ObjectSchema,
  source: "body" | "query" | "params"
): Record<string, any> => {
  const filteredData = filterRequestData(data, schema);

  const { error } = schema.validate(filteredData, { abortEarly: false });

  if (error) {
    throw new AppError(
      `${source}: ${SharedErrorMessages.INVALID_REQUEST_DATA}`,
      httpStatus.BAD_REQUEST,
      error.details.map((detail) => detail.message)
    );
  }

  return filteredData;
};

// Define the interface to specify schema validation for body, query, and params
interface RequestValidationSchemas {
  bodySchema?: ObjectSchema;
  querySchema?: ObjectSchema;
  paramsSchema?: ObjectSchema;
}

// Main validator function that applies schemas to the body, query, and params
export const requestDataValidator = (schemas: RequestValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.bodySchema) {
        // Validate and filter body data
        req.body = validateData(req.body, schemas.bodySchema, "body");
      }

      if (schemas.paramsSchema) {
        // Validate and filter route parameters
        req.params = validateData(req.params, schemas.paramsSchema, "params");
      }

      if (schemas.querySchema) {
        // Validate and filter query parameters
        req.query = validateData(req.query, schemas.querySchema, "query");
      }

      next(); // Proceed to next middleware if validation passes
    } catch (error) {
      next(error); // Pass error to error handling middleware
    }
  };
};
