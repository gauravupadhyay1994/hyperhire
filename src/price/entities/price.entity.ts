import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'eth_price' })
  ethPrice: string;

  @Column({ name: 'polygon_price' })
  polygonPrice: string;

  @Column()
  timestamp: Date;
}
