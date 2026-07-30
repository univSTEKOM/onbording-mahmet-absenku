import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import { AUTH_INSTANCE } from '../../auth/auth.module'
import type { Auth } from '../../auth/auth.instance'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AUTH_INSTANCE) private readonly auth: Auth) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const headers = fromNodeHeaders(req.headers)

    const session = await this.auth.api.getSession({ headers })
    if (!session) {
      throw new UnauthorizedException({ success: false, error: { code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu' } })
    }

    req.user = session.user
    return true
  }
}
