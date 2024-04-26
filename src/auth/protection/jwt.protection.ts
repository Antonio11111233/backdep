import { AuthGuard } from '@nestjs/passport'

export class JwtAuthProtection extends AuthGuard('jwt'){}