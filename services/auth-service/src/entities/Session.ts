import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Session {
  /** 세션 ID (Primary Key, UUID) */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 세션 소유 사용자 (ManyToOne) */
  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User;

  /** 사용자의 User-Agent 정보 (ex: 브라우저, 디바이스 정보) */
  @Column()
  userAgent: string;

  /** 사용자의 IP 주소 */
  @Column()
  ipAddress: string;

  /** 세션이 유효한지 여부 */
  @Column({ default: true })
  isValid: boolean;

  /** 세션 만료일 */
  @Column({ type: 'timestamp' })
  expiredAt: Date;

  /** 레코드 생성일 */
  @CreateDateColumn()
  createdAt: Date;

  /** 레코드 수정일 */
  @UpdateDateColumn()
  updatedAt: Date;
}
