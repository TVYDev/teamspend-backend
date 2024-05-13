import { exceptionErrorCode } from '@/constants/exception';

export interface ExceptionCause {
  errorCode: ExceptionErrorCode;
}

export type ExceptionErrorCode =
  (typeof exceptionErrorCode)[keyof typeof exceptionErrorCode];
