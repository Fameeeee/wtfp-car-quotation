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
    orderNumber: number;

    @IsOptional()
    @IsNumber()
    specialDiscount?: number;

    @IsOptional()
    @IsNumber()
    additionPrice?: number;

    @IsOptional()
    @IsNumber()
    downPaymentPercent?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstallmentPlanDetailDto)
    planDetails: InstallmentPlanDetailDto[];
}

class InstallmentPlanDetailDto {
    @IsNumber()
    period: number;

    @IsOptional()
    @IsNumber()
    // allow null when user leaves interest blank; frontend will send null
    interestRate: number | null;
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

class AdditionCostsDto {
    @IsOptional()
    cmi: boolean;

    @IsOptional()
    insurance: boolean;

    @IsOptional()
    @IsNumber()
    fuelValue?: number;

    @IsOptional()
    @IsString()
    note?: string;
}

export class CreateQuotationDto {
    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    templateKey?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CashPlansDto)
    cashPlans?: CashPlansDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstallmentPlansDto)
    installmentPlans?: InstallmentPlansDto[];


    @IsOptional()
    @ValidateNested()
    @Type(() => AdditionCostsDto)
    additionCosts?: AdditionCostsDto;

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
