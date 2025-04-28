import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class VapidKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!process.env.VAPID_PRIVATE_KEY) {
      throw new HttpException(
        'VAPID_PRIVATE_KEY environment variable is not set',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!process.env.VAPID_PUBLIC_KEY) {
      throw new HttpException(
        'VAPID_PUBLIC_KEY environment variable is not set',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
