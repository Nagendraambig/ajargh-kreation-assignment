import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AuthDto) {
    // Find the user with given email
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new ForbiddenException('Incorrect credential');
      }

      const pwMatches = await argon.verify(user.hash, dto.password);

      if (!pwMatches) {
        throw new ForbiddenException('Incorrect credential');
      }

      return this.signToken(user.id, user.email);
    } catch (ex) {
      throw ex;
    }
  }

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    // Save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;

      return user;
    } catch (ex) {
      if (ex instanceof Prisma.PrismaClientKnownRequestError) {
        if (ex.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }

      throw ex;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRETE'),
    });

    return {
      access_token: token,
    };
  }
}
