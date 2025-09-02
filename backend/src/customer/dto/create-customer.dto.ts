import { IsNotEmpty, IsString, Matches, IsOptional } from "class-validator";

export class CreateCustomerDto {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    // Simple phone number pattern (digits, spaces, plus, dashes)
    @Matches(/^[0-9\s+\-()]+$/)
    phoneNumber: string;

    @IsOptional()
    @IsString()
    note?: string;
}