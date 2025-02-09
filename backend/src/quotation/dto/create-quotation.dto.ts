import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { PaymentMethod } from "../entities/quotation.entity";
import { Type } from "class-transformer";
import { CreateCustomerDto } from "src/customer/dto/create-customer.dto";


class InstallmentPlanDto {
    @IsNotEmpty()
    @IsNumber()
    downPayment: number;

    @IsNotEmpty()
    @IsNumber()
    interestRate: number;

    @IsNotEmpty()
    @IsNumber()
    monthlyPayment: number;
}

class CarDetailsDto {
    @IsNotEmpty()
    unitType: string;

    @IsNotEmpty()
    modelClass: string;

    @IsNotEmpty()
    modelCodeName: string;

    @IsNotEmpty()
    modelGName: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    color: string;
}

class AccessoryDto {
    @IsNotEmpty()
    assType: string;

    @IsNotEmpty()
    assName: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;
}

export class CreateQuotationDto {
    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsNumber()
    totalPrice?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstallmentPlanDto)
    installmentPlans?: InstallmentPlanDto[];

    @IsOptional()
    @IsNumber()
    specialDiscount?: number;

    @IsOptional()
    note?: string;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CarDetailsDto)
    carDetails: CarDetailsDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AccessoryDto)
    accessories?: AccessoryDto[];

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CreateCustomerDto)
    customer: CreateCustomerDto;

    @IsNotEmpty()
    @IsNumber()
    staffId: number;
}
