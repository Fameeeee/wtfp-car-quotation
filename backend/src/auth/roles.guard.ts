import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AuthService } from './auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector, private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    let user = req.user || (req as any).staff || null;

    // If no user attached, try to read Authorization header and verify token
    if (!user) {
      try {
        const authHeader = (req.get && req.get('authorization')) || req.headers['authorization'] || '';
        let token: string | null = null;
        if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7).trim();
        }
        if (token) {
          const payload = this.authService.verifyToken(token);
          if (payload) {
            user = payload as any;
            req.user = user;
          }
        }
      } catch (e) {
        this.logger.warn('Error verifying token in RolesGuard', e?.message || e);
        return false;
      }
    }

    if (!user) return false;
    const role = (user as any).role;
    return requiredRoles.includes(role);
  }
}
