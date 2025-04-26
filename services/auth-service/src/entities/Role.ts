import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Role {
  /** 역할 ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 역할 이름 (예: USER, ADMIN, MANAGER) */
  @Column({ unique: true })
  name: string;

  /** 역할 설명 (선택) */
  @Column({ nullable: true })
  description?: string;

  /** 역할 활성화 여부 */
  @Column({ default: true })
  isActive: boolean;

  /** 역할 우선순위 (숫자가 낮을수록 높은 우선순위) */
  @Column({ default: 999 })
  priority: number;

  /** 역할을 가진 사용자 목록 (N:M) */
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  /** 생성 일시 */
  @CreateDateColumn()
  createdAt: Date;

  /** 수정 일시 */
  @UpdateDateColumn()
  updatedAt: Date;
}
