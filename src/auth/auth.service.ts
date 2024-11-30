import { Injectable } from '@nestjs/common';

import { decode, sign, verify } from 'jsonwebtoken';

const privateKey = process.env.JWT_PRIVATE_KEY || 'dev-private-key';

@Injectable()
export class AuthService {
  generateToken(claims: any) {
    return sign(claims, privateKey, {
      algorithm: 'HS256',
    });
  }

  verifyToken(token: string): boolean {
    try {
      verify(token, privateKey);
      return true;
    } catch (err: any) {
      console.error('Invalid token', err.message);
      return false;
    }
  }

  getSub(token: string): string {
    const claims = decode(token);
    return (claims.sub as string) || '';
  }
}
