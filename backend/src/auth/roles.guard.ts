import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User should be attached by JwtAuthGuard
    if (!user) {
      this.logger.warn('No user found in request. Ensure JwtAuthGuard is applied before RolesGuard.');
      throw new ForbiddenException('Access denied');
    }

    const userRole = user.role;

    if (!userRole) {
      this.logger.warn(`User ${user.id} has no role assigned`);
      throw new ForbiddenException('Access denied - no role assigned');
    }

    // Check if user's role is in the required roles
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      this.logger.warn(
        `User ${user.id} with role '${userRole}' attempted to access resource requiring roles: ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenException(`Access denied - requires one of: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
