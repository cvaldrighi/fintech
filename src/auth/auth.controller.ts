import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GetCurrentUser } from './decorators';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('/local/signup')
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signupLocal(dto);
    }

    @Post('/local/signin')
    @HttpCode(HttpStatus.OK)
    signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signinLocal(dto)
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/logout')
    @HttpCode(HttpStatus.OK)
    logout(@GetCurrentUser('sub') userId: number) {
        return this.authService.logout(userId);
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('/refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@GetCurrentUser('sub') userId: number, @GetCurrentUser('refreshToken') refreshToken: string) {
        return this.authService.refreshTokens(userId, refreshToken)
    }

}
