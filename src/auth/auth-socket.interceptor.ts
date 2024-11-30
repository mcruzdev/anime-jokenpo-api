import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthSocketInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('[authSocketInterceptor] running interecept');
    const client = context.switchToWs().getClient();

    client.data.authorized = false;
    client.data.sub = '';

    const authorization = client.handshake.headers['authorization'] as string;

    if (!authorization) {
      return next.handle();
    }

    const [, token] = authorization.split(' ');

    const verified = this.authService.verifyToken(token);

    client.data.authorized = verified;

    client.data.sub = this.authService.getSub(token);

    return next.handle();
  }
}
