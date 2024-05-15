import { exceptionErrorCode } from '@/lib/constants/exception';

export interface ExceptionCause {
  errorCode: ExceptionErrorCode;
}

export type ExceptionErrorCode =
  (typeof exceptionErrorCode)[keyof typeof exceptionErrorCode];
