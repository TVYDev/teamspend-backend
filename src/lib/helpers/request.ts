import { Request } from 'express';
import {
  X_DEVICE_ID_HEADER,
  X_DEVICE_NAME_HEADER,
} from '@/lib/constants/request';
import { DeviceInfo } from '@/lib/interfaces/request';

export const getDeviceInfoFromHeaders = (
  headers: Request['headers']
): DeviceInfo => {
  const deviceId = (headers[X_DEVICE_ID_HEADER] || 'n/a') as string;
  const deviceName = (headers[X_DEVICE_NAME_HEADER] || 'n/a') as string;

  return { deviceId, deviceName };
};
