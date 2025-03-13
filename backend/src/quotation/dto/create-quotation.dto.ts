import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { PaymentMethod } from "../entities/quotation.entity";
import { Type } from "class-transformer";
import { CreateCustomerDto } from "src/customer/dto/create-customer.dto";

class CashPlansDto {
    @IsOptional()
    @IsNumber()
    totalPrice?: number;

    @IsOptional()
    @IsNumber()
    specialDiscount?: number;

    @IsOptional()
    @IsNumber()
    additionPrice?: number;
}

class InstallmentPlansDto {
    @IsNumber()
    planNumber: number;

    @IsNumber()
    downPayment: number;

    @IsOptional()
    @IsNumber()
    specialDiscount?: number;

    @IsOptional()
    @IsNumber()
    additionPrice?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstallmentOrderDto)
    orders: InstallmentOrderDto[];
}

class InstallmentOrderDto {
    @IsNumber()
    orderNumber: number;

    @IsNumber()
    period: number;

    @IsOptional()
    @IsNumber()
    monthlyPayment?: number;

    @IsOptional()
    @IsNumber()
    interestRate?: number;
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
    @ValidateNested()
    @Type(() => CashPlansDto)
    cashPlans?: CashPlansDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstallmentPlansDto)
    installmentPlans?: InstallmentPlansDto[];

    @IsString()
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
