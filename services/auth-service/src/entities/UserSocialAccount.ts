import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class UserSocialAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provider: string; // ex: 'google', 'kakao', 'naver'

  @Column()
  providerId: string; // ex: Google의 sub

  @Column({ nullable: true })
  email?: string;

  @CreateDateColumn()
  linkedAt: Date;

  @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
  user: User;
}
