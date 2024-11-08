import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import Moralis from 'moralis';
import { Price } from './entities/price.entity';
import { BigNumber } from 'bignumber.js';
import nodemailer from 'nodemailer';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
  ) {
    Moralis.start({
      apiKey:
        process.env.MORALIS_APP_ID ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjE2ZDEwOGExLWFlZGItNGQwMy1iODU0LTRhNjg0OTQ4OWYxNiIsIm9yZ0lkIjoiMjMxNjkxIiwidXNlcklkIjoiMjMyNTk5IiwidHlwZUlkIjoiZmY4MjdmNjQtNmU3YS00ZTlkLWI1NzEtMTY4NzI3ZTk3MGUwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTE3NDkwNDgsImV4cCI6NDg0NzUwOTA0OH0.C-f-Bmo94BY8-rNezwi5jXmBbAsUqArOM6t84oW88t4',
    });
    setTimeout(() => this.fetchPrices(), 10000);
  }

  private async fetchPrices() {
    try {
      await this.fetchAndSavePrices();
      setTimeout(() => this.fetchPrices(), 300000);
    } catch (error) {
      console.error('Error fetching prices:', error.message);
      setTimeout(() => this.fetchPrices(), 300000);
    }
  }

  async fetchAndSavePrices() {
    const prices = await this.getPriceFromApi();

    await this.savePrice(
      prices.ethPrice.toString(),
      prices.polygonPrice.toString(),
    );
  }

  private async getPriceFromApi() {
    const ethPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
      chain: '0x1',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    });

    const polygonPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
      chain: '0x89',
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    });

    const prices = {
      ethPrice: ethPriceResponse.raw.usdPrice,
      polygonPrice: polygonPriceResponse.raw.usdPrice,
    };

    return prices;
  }

  private async savePrice(ethPrice: string, polygonPrice: string) {
    const newPrice = this.priceRepository.create({
      ethPrice,
      polygonPrice,
      timestamp: new Date(),
    });
    await this.priceRepository.save(newPrice);
  }
  async getHourlyPrices(): Promise<any> {
    const now = new Date();

    // Calculate the start of the 24-hour period
    const startOfDay = new Date(now);
    startOfDay.setHours(now.getHours() - 24);
    startOfDay.setMinutes(0);
    startOfDay.setSeconds(0);
    startOfDay.setMilliseconds(0);

    // Fetch prices within the last 24 hours
    const prices = await this.priceRepository.find({
      where: { timestamp: MoreThanOrEqual(startOfDay) },
      order: { timestamp: 'ASC' },
    });

    // Group prices by hour
    const hourlyPrices = this.groupPricesByHour(prices);

    return hourlyPrices;
  }

  // Helper method to group prices by hour
  private groupPricesByHour(prices: Price[]): any[] {
    const hourlyPrices = [];

    prices.forEach((price) => {
      const hour = new Date(price.timestamp).getHours(); // Extract the hour from timestamp

      // If no entry for this hour, create one
      if (!hourlyPrices[hour]) {
        hourlyPrices[hour] = { hour, ethPrice: 0, polygonPrice: 0, count: 0 };
      }

      // Sum up the prices and count occurrences
      hourlyPrices[hour].ethPrice += parseFloat(price.ethPrice);
      hourlyPrices[hour].polygonPrice += parseFloat(price.polygonPrice);
      hourlyPrices[hour].count += 1;
    });

    // Calculate the average price for each hour
    return hourlyPrices
      .filter((price) => price)
      .map((price) => ({
        hour: price.hour,
        ethPrice: (price.ethPrice / price.count).toFixed(2),
        polygonPrice: (price.polygonPrice / price.count).toFixed(2),
      }));
  }

  // Create a transporter using an email provider's SMTP server
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

  private async sendEmail(priceChange: string) {
    const transporter = this.createTransporter();

    const msg = {
      from: process.env.EMAIL, // The email you're sending from
      to: 'hyperhire_assignment@hyperhire.in', // Recipient email address
      subject: 'Price Alert: Chain Price Increased by More Than 3%',
      text: `The price of the chain has increased by ${priceChange}.`, // Email content
    };

    try {
      console.log(
        'before uncommenting below please add email Id and password in the .env',
      );
      // const info = await transporter.sendMail(msg);
      // console.log('Email sent: ', info.response);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  private async checkPriceChange() {
    try {
      // Get the latest price
      const latestPrice = await this.priceRepository.find({
        order: { timestamp: 'DESC' },
        take: 1,
      });

      // Get the price from one hour ago
      const oneHourAgoPrice = await this.priceRepository.findOne({
        where: {
          timestamp: LessThanOrEqual(
            new Date(new Date().getTime() - 60 * 60 * 1000),
          ), // 1 hour ago
        },
        order: { timestamp: 'DESC' },
      });

      if (!latestPrice || !oneHourAgoPrice) {
        console.log('Not enough data to compare prices');
        return;
      }

      // Calculate the percentage change in price for Ethereum using BigNumber
      const ethPriceChange = this.calculatePriceChange(
        new BigNumber(latestPrice[0].ethPrice),
        new BigNumber(oneHourAgoPrice.ethPrice),
      );

      // Calculate the percentage change in price for Polygon using BigNumber
      const polygonPriceChange = this.calculatePriceChange(
        new BigNumber(latestPrice[0].polygonPrice),
        new BigNumber(oneHourAgoPrice.polygonPrice),
      );

      // If price has increased by more than 3% for Ethereum, send an email
      if (ethPriceChange > 3) {
        await this.sendEmail(`Ethereum price increased by more than 3%.`);
      }

      // If price has increased by more than 3% for Polygon, send an email
      if (polygonPriceChange > 3) {
        await this.sendEmail(`Polygon price increased by more than 3%.`);
      }
    } catch (error) {
      console.error('Error checking price change:', error);
    }

    // Re-run this check every 5 minutes (or any desired interval)
    setTimeout(() => this.checkPriceChange(), 300000); // 5 minutes in ms
  }

  // Calculate the price change percentage using BigNumber
  private calculatePriceChange(
    currentPrice: BigNumber,
    previousPrice: BigNumber,
  ): number {
    const priceChange = currentPrice
      .minus(previousPrice)
      .dividedBy(previousPrice)
      .multipliedBy(100);
    return priceChange.toNumber(); // Convert to a number for comparison
  }

  private async getTokenPrices() {
    try {
      const [wethResponse, wbtcResponse] = await Promise.all([
        Moralis.EvmApi.token.getTokenPrice({
          chain: '0x1', // Ethereum Mainnet
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH Contract address
        }),
        Moralis.EvmApi.token.getTokenPrice({
          chain: '0x1', // Ethereum Mainnet
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC Contract address
        }),
      ]);

      // Extract and return both prices
      const wethPrice = new BigNumber(wethResponse.raw.usdPrice);
      const wbtcPrice = new BigNumber(wbtcResponse.raw.usdPrice);

      return { wethPrice, wbtcPrice };
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return { wethPrice: new BigNumber(0), wbtcPrice: new BigNumber(0) };
    }
  }

  // Example usage to calculate the WBTC for a given ETH amount
  public async calculateWBTCForETH(ethAmount: BigNumber) {
    const { wethPrice, wbtcPrice } = await this.getTokenPrices();

    if (wethPrice.isZero() || wbtcPrice.isZero()) {
      console.log('Error: Could not fetch token prices');
      return;
    }

    // Convert ETH to WETH (1 ETH = 1 WETH)
    const wethAmount = ethAmount;

    // Calculate the equivalent WBTC by converting WETH to USD and then to WBTC
    const wbtcAmount = wethAmount.multipliedBy(wethPrice).dividedBy(wbtcPrice);

    // Calculate the fee for the transaction (3% fee)
    const feeInETH = this.calculateFee(ethAmount, 0.03); // 3% fee in ETH
    const feeInUSD = feeInETH.multipliedBy(wethPrice); // Fee in USD

    return {
      wbtcAmount,
      feeInETH,
      feeInUSD,
    };
  }
  private calculateFee(amount: BigNumber, feePercentage: number) {
    const feeInETH = amount.multipliedBy(feePercentage); // Fee in ETH
    return feeInETH;
  }
}
