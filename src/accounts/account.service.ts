import { Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { Account } from "./types";

@Injectable()
export class AccountService {

    constructor(private prisma: PrismaService) { }

    async getAccountBySignedUser(userId: number): Promise<Account> {

        const user = await this.prisma.users.findUnique({
            where: {
                id: userId
            }
        })

        const userAccount = await this.prisma.accounts.findUnique({
            where: {
                id: user.accountId
            }
        })

        return userAccount;
    }
}