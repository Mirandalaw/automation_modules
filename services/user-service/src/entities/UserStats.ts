import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User';

/**
 * 사용자 등급 Enum
 * - 실수 방지를 위한 enum 타입 정의
 */
export enum UserGrade {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

@Entity()
export class UserStats {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index('idx_user_stats_user_id')
  @OneToOne(() => User, (user) => user.stats, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // 누적 거래 건수
  @Column({ default: 0 })
  tradeCount: number;

  // 누적 거래 금액
  @Column({ type: 'bigint', default: 0 })
  totalTradeAmount: number;

  // 현재 보유 캐시 (포인트와 별도일 경우 유지)
  @Column({ type: 'bigint', default: 0 })
  availableCash: number;

  // 사용자 레벨
  @Column({ type: 'smallint', default: 1 })
  level: number;

  // 사용자 등급 (enum 기반)
  @Column({
    type: 'enum',
    enum: UserGrade,
    default: UserGrade.BRONZE,
  })
  grade: UserGrade;

  // 경험치
  @Column({ type: 'int', default: 0 })
  experience: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
