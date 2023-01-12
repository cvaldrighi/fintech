import { Module } from "@nestjs/common";
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AccountService } from '../accounts/account.service';

@Module({
    controllers: [TransactionController],
    providers: [TransactionService, AccountService]
})
export class TransactionModule { }