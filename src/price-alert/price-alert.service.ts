import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceAlert } from './entities/price-alert.entity';
import { Price } from 'src/price/entities/price.entity';
import { PriceAlertDto } from './dto/create-price-alert.dto';
import * as nodemailer from 'nodemailer';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class PriceAlertService {
  constructor(
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
  ) {
    // Start checking alerts after the service is initialized
    setTimeout(() => this.checkPriceAlerts(), 10000);
  }

  // Method to set price alerts
  async setPriceAlert(createPriceAlertDto: PriceAlertDto) {
    const alert = this.priceAlertRepository.create(createPriceAlertDto);
    return await this.priceAlertRepository.save(alert);
  }

  // Method to check if any price condition has been met
  private async checkPriceAlerts() {
    const alerts = await this.priceAlertRepository.find();

    // Fetch the latest price record once
    const priceRecord = await this.priceRepository.findOne({
      order: { timestamp: 'DESC' }, // Get the most recent price
    });

    if (priceRecord) {
      const currentEthPrice = new BigNumber(priceRecord.ethPrice); // Using BigNumber for ETH price
      const currentPolygonPrice = new BigNumber(priceRecord.polygonPrice); // Using BigNumber for Polygon price

      // Iterate through all alerts and check the conditions
      for (const alert of alerts) {
        if (
          alert.chain === 'ethereum' &&
          currentEthPrice.gte(new BigNumber(alert.price))
        ) {
          await this.sendEmail(
            alert.email,
            'Ethereum',
            currentEthPrice.toString(),
          );
          await this.priceAlertRepository.delete(alert.id); // Delete the alert after triggering it
        }

        if (
          alert.chain === 'polygon' &&
          currentPolygonPrice.gte(new BigNumber(alert.price))
        ) {
          await this.sendEmail(
            alert.email,
            'Polygon',
            currentPolygonPrice.toString(),
          );
          await this.priceAlertRepository.delete(alert.id); // Delete the alert after triggering it
        }
      }
    }

    // Check every 5 minutes (300000 ms)
    setTimeout(() => this.checkPriceAlerts(), 300000);
  }

  // Helper method to send email notifications
  private async sendEmail(email: string, chain: string, price: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use any email service provider here
      auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password', // Replace with your email password (consider using OAuth2 or App password for security)
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com', // Sender address
      to: email, // Receiver address
      subject: `Price Alert: ${chain} Price Reached`, // Email subject
      text: `The price of ${chain} has reached ${price} USD.`, // Email content
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
