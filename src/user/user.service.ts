import { Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { User } from "./types";


@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) { }

    async getAllUsers() {
        const allUsers = await this.prisma.users.findMany({
            select: {
                id: true,
                username: true,
                password: false,
                hashedRT: false,
                accountId: true
            }
        });
        return allUsers;
    }

    async getCurrentUser(userId: number): Promise<User> {

        const currentUser = await this.prisma.users.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                password: false,
                hashedRT: false,
                accountId: true
            }
        })

        return currentUser;
    }

    async getUserByAccount(accountId: number): Promise<User> {

        const user = await this.prisma.users.findUnique({
            where: {
                accountId: accountId
            },
            select: {
                id: true,
                username: true,
                password: false,
                hashedRT: false,
                accountId: true
            }
        })

        return user;
    }
}