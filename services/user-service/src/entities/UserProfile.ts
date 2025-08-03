import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userUuid', referencedColumnName: 'uuid' }) // uuid 컬럼으로 참조
  user: User;

  @Column()
  userUuid: string;

  @Column({ length: 30, unique: true })
  nickname: string;

  @Column({ type: 'text', default: '' })
  bio: string;

  @Column({ type: 'text', nullable: true })
  profileImageUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
