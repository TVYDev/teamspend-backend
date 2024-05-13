import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  constructor() {}

  generateRsaKeys() {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
  }

  encryptRsa(data: string) {
    const rsaPublicKey = process.env.RSA_PUBLIC_KEY;
    if (!rsaPublicKey) {
      throw new Error('RSA_PUBLIC_KEY is not defined');
    }

    const encryptedData = crypto.publicEncrypt(
      {
        key: rsaPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(data)
    );

    return encryptedData.toString('base64');
  }

  decryptRsa(data: string) {
    const rsaPrivateKey = process.env.RSA_PRIVATE_KEY;
    if (!rsaPrivateKey) {
      throw new Error('RSA_PRIVATE_KEY is not defined');
    }

    const decryptedData = crypto.privateDecrypt(
      {
        key: rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(data, 'base64')
    );

    return decryptedData.toString();
  }
}
