import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class PasswordHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hashedPassword: string;

  @CreateDateColumn()
  changedAt: Date;

  @ManyToOne(() => User, (user) => user.passwordHistories, { onDelete: 'CASCADE' })
  user: User;
}
