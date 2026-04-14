import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: { sub: number; email: string; perfil: string }) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: payload.sub },
    });
    if (!user || user.status !== 'ATIVO') {
      throw new UnauthorizedException('Utilizador inativo ou não encontrado.');
    }
    return { id: payload.sub, email: payload.email, perfil: payload.perfil };
  }
}
