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
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.passwordHistories, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  passwordHash: string;

  @CreateDateColumn()
  changedAt: Date;
}
