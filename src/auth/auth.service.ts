import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: { select: { id: true, name: true, status: true } } },
    });

    if (!user) throw new UnauthorizedException('Credenciales invalidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales invalidas');

    if (user.company.status !== 'ACTIVE') {
      throw new UnauthorizedException('La empresa no esta activa');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        company: { select: { id: true, name: true, cuit: true } },
      },
    });
  }
}
