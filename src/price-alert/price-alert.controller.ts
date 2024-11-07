import { Controller, Post, Body } from '@nestjs/common';
import { PriceAlertService } from './price-alert.service';
import { PriceAlertDto } from './dto/create-price-alert.dto';

@Controller('price-alerts')
export class PriceAlertController {
  constructor(private readonly priceAlertService: PriceAlertService) {}

  // Endpoint to set a price alert
  @Post()
  async setPriceAlert(@Body() createPriceAlertDto: PriceAlertDto) {
    return await this.priceAlertService.setPriceAlert(createPriceAlertDto);
  }
}
