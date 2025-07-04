import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { IResponseData } from "../interfaces/response-data.interface";
import { incomingDataCollector } from "../functions/incoming-data-collector.function";
import { IRequestWithUser } from "../interfaces/request-with-user.interface";
import { SharedSuccessMessages } from "../enums/shared-messages.enum";
import { responseDataModifier } from "../functions/response-data-modifier.function";

export const responseFormatter = (
  fn: (...data: any) => Promise<IResponseData<any>>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestData = incomingDataCollector(req); // Extract request data

      // Get requester user from request if available
      const requesterUser = (req as IRequestWithUser).user;

      // Call the controller function with passing the request data and attached data as arguments and get the result
      const fnResult: IResponseData = await fn?.apply({}, [
        requestData,
        requesterUser,
        req,
      ]);

      // Ensure default values for response properties
      const responseObject: IResponseData = {
        success: true,
        statusCode: fnResult?.statusCode || httpStatus.OK,
        message: fnResult.message || SharedSuccessMessages.SUCCESS,
        data: fnResult.data || {},
      };

      // Process response data before sending it
      responseObject.data = responseDataModifier(
        JSON.parse(JSON.stringify(responseObject.data))
      );

      // Send the response and ensure nothing is returned from middleware
      res
        .status(responseObject?.statusCode || httpStatus.OK)
        .json(responseObject);
    } catch (error) {
      next(error); // Pass error to Express error handler
    }
  };
};
