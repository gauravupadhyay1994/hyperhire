import { Controller, Get, Param } from '@nestjs/common';
import { PriceService } from './price.service';
import { BigNumber } from 'bignumber.js';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  // Endpoint to get hourly prices
  @Get('hourly')
  async getHourlyPrices() {
    try {
      const hourlyPrices = await this.priceService.getHourlyPrices();
      return hourlyPrices;
    } catch (error) {
      return { error: 'Unable to fetch hourly prices' };
    }
  }

  // Endpoint to calculate WBTC for a given ETH amount
  @Get('wbtc-for-eth/:ethAmount')
  async calculateWBTCForETH(@Param('ethAmount') ethAmount: string) {
    try {
      const ethAmountBN = new BigNumber(ethAmount); // Convert input to BigNumber
      const result = await this.priceService.calculateWBTCForETH(ethAmountBN);
      return result;
    } catch (error) {
      return { error: 'Unable to calculate WBTC for ETH' };
    }
  }
}
