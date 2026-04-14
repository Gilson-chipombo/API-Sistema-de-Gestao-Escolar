import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email já registado.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.usuario.create({
      data: {
        ...dto,
        password: hashed,
        status: 'ATIVO',
      },
    });
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas.');

    if (user.status !== 'ATIVO') throw new UnauthorizedException('Conta inativa.');

    const payload = { sub: user.id_usuario, email: user.email, perfil: user.perfil };
    return {
      access_token: this.jwtService.sign(payload),
      perfil: user.perfil,
      user_name: user.user_name,
    };
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      where: { deleted_at: null },
      select: { id_usuario: true, user_name: true, email: true, perfil: true, status: true, created_at: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true, user_name: true, email: true, perfil: true, status: true, created_at: true },
    });
    if (!user) throw new NotFoundException(`Utilizador #${id} não encontrado.`);
    return user;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { deleted_at: new Date(), status: 'INATIVO' },
    });
  }
}
