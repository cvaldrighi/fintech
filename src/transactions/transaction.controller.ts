import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { CashOutDto } from "./dto";
import { TransactionService } from "./transaction.service";

@Controller('transaction')
export class TransactionController {
    constructor(private transactionService: TransactionService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('/transfer')
    @HttpCode(HttpStatus.OK)
    transfer(@Req() req: Request, @Body() dto: CashOutDto) {
        const from = req.user['sub'];
        return this.transactionService.transfer(from, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/user')
    @HttpCode(HttpStatus.OK)
    getTransactionsByUserAccount(@Req() req: Request) {
        const user = req.user['sub'];
        return this.transactionService.getTransactionsByUserAccount(user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/user/cash-out')
    @HttpCode(HttpStatus.OK)
    getCashOutTransactions(@Req() req: Request) {
        const user = req.user['sub'];
        return this.transactionService.getCashOutTransactions(user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/user/cash-in')
    @HttpCode(HttpStatus.OK)
    getCashInTransactions(@Req() req: Request) {
        const user = req.user['sub'];
        return this.transactionService.getCashInTransactions(user);
    }
}