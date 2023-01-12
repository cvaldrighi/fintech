import { Controller, HttpCode, Post, HttpStatus, Body, UseGuards, Get, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';


@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    @HttpCode(HttpStatus.OK)
    getAllUsers() {
        return this.userService.getAllUsers();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/')
    @HttpCode(HttpStatus.OK)
    getCurrentUser(@Req() req: Request) {
        return this.userService.getCurrentUser(req.user['sub']);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:accountId')
    @HttpCode(HttpStatus.OK)
    getUserByAccountId(@Param('accountId') accountId: string) {
        return this.userService.getUserByAccount(parseInt(accountId));
    }
}