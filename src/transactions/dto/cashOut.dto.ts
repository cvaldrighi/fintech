import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CashOutDto {

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsNumber()
    value: number;
}