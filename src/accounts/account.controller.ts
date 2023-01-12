import { Controller, HttpCode, Post, HttpStatus, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AccountService } from './account.service';


@Controller('account')
export class AccountController {

    constructor(private accountService: AccountService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('/')
    @HttpCode(HttpStatus.OK)
    getAccountBySignedUser(@Req() req: Request) {
        return this.accountService.getAccountBySignedUser(req.user['sub']);
    }
}