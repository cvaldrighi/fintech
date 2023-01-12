import { ForbiddenException, Injectable } from "@nestjs/common";
import { AccountService } from "src/accounts/account.service";
import { PrismaService } from '../prisma/prisma.service';
import { CashOutDto } from "./dto";

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService, private account: AccountService) { }

    async transfer(from: number, dto: CashOutDto) {

        const currentUserAccount = await this.account.getAccountBySignedUser(from);
        const creditedUser = await this.prisma.users.findUnique({
            where: {
                username: dto.username
            }
        })

        if (currentUserAccount.id == creditedUser.id) {
            throw new ForbiddenException("You can't transfer to yourself");
        }

        const transfer = await this.prisma.transactions.create({
            data: {
                debitedAccountId: currentUserAccount.id,
                creditedAccountId: creditedUser.id,
                value: dto.value
            }
        })

        //debit from
        const debitValue = currentUserAccount.balance - dto.value;
        const debitFrom = await this.prisma.accounts.update({
            where: {
                id: currentUserAccount.id
            },
            data: {
                balance: debitValue
            }
        })

        //credit to
        const creditedUserAccount = await this.prisma.accounts.findUnique({
            where: {
                id: creditedUser.id
            }
        })
        const creditValue = creditedUserAccount.balance + dto.value;
        const creditTo = await this.prisma.accounts.update({
            where: {
                id: creditedUser.id
            },
            data: {
                balance: creditValue
            }
        })

        return transfer;
    }

    async getTransactionsByUserAccount(user: number) {

        const currentUserAccount = await this.account.getAccountBySignedUser(user);
        const transactionsByUser = await this.prisma.transactions.findMany({
            where: {
                OR: [
                    {
                        debitedAccountId: currentUserAccount.id,
                    },
                    {
                        creditedAccountId: currentUserAccount.id
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return transactionsByUser;
    }

    async getCashOutTransactions(user: number) {
        const currentUserAccount = await this.account.getAccountBySignedUser(user);
        const cashOutTransactionsByUser = await this.prisma.transactions.findMany({
            where: {
                debitedAccountId: currentUserAccount.id,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return cashOutTransactionsByUser;
    }

    async getCashInTransactions(user: number) {
        const currentUserAccount = await this.account.getAccountBySignedUser(user);
        const cashInTransactionsByUser = await this.prisma.transactions.findMany({
            where: {
                creditedAccountId: currentUserAccount.id,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return cashInTransactionsByUser;
    }
}