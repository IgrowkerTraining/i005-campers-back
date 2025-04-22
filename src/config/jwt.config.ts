import { JwtModuleOptions } from '@nestjs/jwt';

export function jwtConfig(): JwtModuleOptions {
  return {
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: '7d',
    },
  };
}
