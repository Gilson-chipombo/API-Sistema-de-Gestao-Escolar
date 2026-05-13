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
      id_usuario: user.id_usuario,
      email: user.email,
      perfil: user.perfil,
      user_name: user.user_name,
      status: user.status,
      estudanteId: user.estudanteId || null,
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

  async update(id: number, dto: any) {
    await this.findOne(id);

    const updateData: any = {};

    if (dto.user_name) {
      updateData.user_name = dto.user_name;
    }

    if (dto.email) {
      const emailExists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
      if (emailExists && emailExists.id_usuario !== id) {
        throw new ConflictException('Email já registado.');
      }
      updateData.email = dto.email;
    }

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.status) {
      updateData.status = dto.status;
    }

    const user = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: updateData,
      select: { id_usuario: true, user_name: true, email: true, perfil: true, status: true, created_at: true },
    });
    return user;
  }

  async changePassword(
    id: number,
    dto: { currentPassword: string; newPassword: string; confirmPassword: string },
  ) {
    // Validar se as senhas novas coincidem
    if (dto.newPassword !== dto.confirmPassword) {
      throw new UnauthorizedException('As novas palavras-passe não coincidem.');
    }

    // Validar comprimento mínimo
    if (dto.newPassword.length < 6) {
      throw new UnauthorizedException('A nova palavra-passe deve ter pelo menos 6 caracteres.');
    }

    // Buscar utilizador
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });
    if (!user) throw new NotFoundException(`Utilizador #${id} não encontrado.`);

    // Verificar se a senha atual está correta
    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Palavra-passe atual incorreta.');

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Atualizar a senha
    const updatedUser = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { password: hashedPassword },
      select: { id_usuario: true, user_name: true, email: true, perfil: true, status: true, created_at: true },
    });

    return {
      message: 'Palavra-passe alterada com sucesso.',
      user: updatedUser,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { deleted_at: new Date(), status: 'INATIVO' },
    });
  }
}
