export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public data: any; // Extra error data (optional)

  constructor(
    message: string,
    statusCode: number = 500,
    data: any = null,
    isOperational: boolean = true
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype); // Ensures proper prototype chain

    this.name = this.constructor.name; // Sets a meaningful error name
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}
