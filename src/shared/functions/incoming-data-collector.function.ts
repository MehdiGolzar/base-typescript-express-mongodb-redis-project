import { Request } from 'express';
import { Types, isValidObjectId } from "mongoose";

export const incomingDataCollector = (req: Request) => {
  const requestData = {
    ...req.body,
    ...req.params,
    ...req.query,
  };

  if (requestData.id) {
    requestData["_id"] = new Types.ObjectId(requestData.id as string);
    delete requestData.id;
  }

  for (const key in requestData) {
    if (
      typeof requestData[key] === "string" &&
      isValidObjectId(requestData[key])
    ) {
      requestData[key] = new Types.ObjectId(requestData[key] as string);
    } else if (
      Array.isArray(requestData[key]) &&
      requestData[key].every(
        (el: unknown) => typeof el === "string" && isValidObjectId(el)
      )
    ) {
      requestData[key] = requestData[key].map(
        (el: string) => new Types.ObjectId(el)
      );
    }
  }

  return requestData;
};
