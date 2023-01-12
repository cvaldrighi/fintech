import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    async getTokens(userId: number, username: string): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                },
                {
                    secret: 'at-secret',
                    expiresIn: '1d',
                }

            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                },
                {
                    secret: 'rt-secret',
                    expiresIn: 60 * 60 * 24 * 7
                }

            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt
        }
    }

    async updateRtHash(userId: number, rt: string) {
        const hash = await this.hashData(rt)
        await this.prisma.users.update({
            where: {
                id: userId
            },
            data: {
                hashedRT: hash
            }
        })
    }

    async signupLocal(dto: AuthDto): Promise<Tokens> {
        //validating username
        const usernameExists = await this.prisma.users.findUnique({
            where: {
                username: dto.username
            }
        })
        if (usernameExists) {
            throw new ForbiddenException("This username already exists, try another");
        }
        if (dto.username.length < 3) {
            throw new ForbiddenException("Username must have at least 3 char");
        }

        //validating pass
        const strongPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!strongPass.test(dto.password)) {
            throw new ForbiddenException("Password must have at least 8 char, 1 uppercase and 1 number")
        }
        const password = await this.hashData(dto.password);

        //creating account for user
        const account = await this.prisma.accounts.create({
            data: {
                balance: 100
            }
        })

        //creating user
        const newUser = await this.prisma.users.create({
            data: {
                username: dto.username,
                password,
                accountId: account.id

            }
        })

        //returning tokens
        const tokens = await this.getTokens(newUser.id, newUser.username);
        await this.updateRtHash(newUser.id, tokens.refresh_token);
        return tokens;
    }

    async signinLocal(dto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.users.findUnique({
            where: {
                username: dto.username
            }
        })

        if (!user) throw new ForbiddenException("User not found");

        const passMatches = await bcrypt.compare(dto.password, user.password);

        if (!passMatches) throw new ForbiddenException("Wrong Password");

        const tokens = await this.getTokens(user.id, user.username);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: number) {

        await this.prisma.users.updateMany({
            where: {
                id: userId,
                hashedRT: {
                    not: null,
                },
            },
            data: {
                hashedRT: null
            }
        })
    }

    async refreshTokens(userId: number, rt: string) {
        const user = await this.prisma.users.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) throw new ForbiddenException("Access Denied");

        const rtMatches = await bcrypt.compare(rt, user.hashedRT);
        if (!rtMatches) throw new ForbiddenException("Access Denied");

        const tokens = await this.getTokens(user.id, user.username);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }
}
