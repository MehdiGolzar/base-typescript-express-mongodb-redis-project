// Define the interface for list metadata
export interface ListMetaData {
  totalCount: number;
  totalPage?: number;
}

// Define the interface for response data
export interface IResponseData<T = any> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: Partial<T> | Partial<T>[] | any;
  metadata?: ListMetaData;
}
