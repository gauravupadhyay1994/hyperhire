import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { Price } from './entities/price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price])], // Register the Price entity with TypeORM
  providers: [PriceService], // Register the PriceService
  controllers: [PriceController], // Register the PriceController
})
export class PriceModule {}
