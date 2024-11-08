import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceAlert } from './entities/price-alert.entity';
import { Price } from 'src/price/entities/price.entity';
import { PriceAlertDto } from './dto/create-price-alert.dto';
import { BigNumber } from 'bignumber.js';
import nodemailer from 'nodemailer';
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
    const priceRecord = await this.priceRepository.find({
      order: { timestamp: 'DESC' }, // Get the most recent price
      take: 1,
    });

    if (priceRecord.length != 0) {
      const currentEthPrice = new BigNumber(priceRecord[0].ethPrice); // Using BigNumber for ETH price
      const currentPolygonPrice = new BigNumber(priceRecord[0].polygonPrice); // Using BigNumber for Polygon price

      // Iterate through all alerts and check the conditions
      for (const alert of alerts) {
        console.log(alert);
        if (
          alert.chain === '1' &&
          currentEthPrice.gte(new BigNumber(alert.price))
        ) {
          await this.sendEmail(
            alert.email,
            'Ethereum',
            currentEthPrice.toString(),
          );
        }

        if (
          alert.chain === '137' &&
          currentPolygonPrice.gte(new BigNumber(alert.price))
        ) {
          await this.sendEmail(
            alert.email,
            'Polygon',
            currentPolygonPrice.toString(),
          );
        }
      }
    }

    // Check every 5 minutes (300000 ms)
    setTimeout(() => this.checkPriceAlerts(), 300000);
  }

  createTransporter = () => {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL, // Your email address (e.g. 'example@gmail.com')
        pass: process.env.PASSWORD, // Your email account's password or app-specific password
      },
    });
    return transporter;
  };

  // Helper method to send email notifications
  private async sendEmail(email: string, chain: string, price: string) {
    if (!process.env.EMAIL || !process.env.PASSWORD) {
      console.log('Please enter the email and password in the .env file');
      return;
    }
    const transporter = this.createTransporter();
    const mailOptions = {
      to: email, // Receiver address
      from: process.env.EMAIL, // Your email
      subject: `Price Alert: ${chain} Price Reached`,
      text: `The price of ${chain} has reached ${price} USD.`, // Email content
    };

    try {
      console.log(
        'before uncommenting below please add email Id and password in the .env',
      );

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
