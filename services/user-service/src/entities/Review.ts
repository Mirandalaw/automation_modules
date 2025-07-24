import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity()
@Unique(['tradeId', 'reviewer'])
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.writtenReviews, { onDelete: 'CASCADE' })
  reviewer: User;

  @ManyToOne(() => User, (user) => user.receivedReviews, { onDelete: 'CASCADE' })
  reviewee: User;

  @Column({ type: 'bigint' })
  tradeId: number;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
