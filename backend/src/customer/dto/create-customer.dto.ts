import { IsNotEmpty, IsString } from "class-validator";

export class CreateCustomerDto {
    @IsNotEmpty()
    @IsString()
    firstname: string;

    @IsNotEmpty()
    @IsString()
    lastname: string;
}