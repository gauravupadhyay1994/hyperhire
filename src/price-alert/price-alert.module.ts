import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceAlertController } from './price-alert.controller';
import { PriceAlertService } from './price-alert.service';
import { PriceAlert } from './entities/price-alert.entity';
import { Price } from 'src/price/entities/price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceAlert, Price])],
  controllers: [PriceAlertController],
  providers: [PriceAlertService],
})
export class PriceAlertModule {}
