// src/price-alert/dto/set-price-alert.dto.ts
import { IsString, IsEmail, IsDecimal, IsNotEmpty } from 'class-validator';

export class PriceAlertDto {
  @IsString()
  @IsNotEmpty()
  chain: string;

  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
