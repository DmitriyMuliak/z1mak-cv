export type AppError<TCode = string, TErrorData = Record<string, unknown>> = {
  httpStatus?: number;
  code: TCode;
  message?: string;
  data?: TErrorData;
};

export type ServerActionResultSuccess<TData> = { success: true; data: TData };

export type ServerActionResultFailure<TError = AppError> = { success: false; error: TError };

export type ServerActionResult<TData, TError = AppError> =
  | ServerActionResultSuccess<TData>
  | ServerActionResultFailure<TError>;
