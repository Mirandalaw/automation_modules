import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './UserProfile';
import { UserStats } from './UserStats';
import { Point } from './Point';
import { Review } from './Review';
import { PasswordHistory } from './PasswordHistory';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @OneToOne(() => UserStats, (stats) => stats.user)
  stats: UserStats;

  @OneToMany(() => Point, (point) => point.user)
  points: Point[];

  @OneToMany(() => Review, (review) => review.reviewer)
  writtenReviews: Review[];

  @OneToMany(() => Review, (review) => review.reviewee)
  receivedReviews: Review[];

  @OneToMany(() => PasswordHistory, (history) => history.user)
  passwordHistories: PasswordHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
