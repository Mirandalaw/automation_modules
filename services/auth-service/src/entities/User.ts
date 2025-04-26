import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { RefreshToken } from './RefreshToken';
import { PasswordHistory } from './PasswordHistory';
import { UserSocialAccount } from './UserSocialAccount';
import { Session } from './Session';
import { Role } from './Role';

@Entity()
export class User {
  /** 사용자 UUID */
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  /** 사용자 이름 */
  @Column()
  name: string;

  /** 사용자 이메일 (유니크) */
  @Column({ unique: true })
  email: string;

  /** 사용자 비밀번호 (nullable) */
  @Column({ nullable: true })
  password?: string;

  /** 사용자 휴대폰 번호 (nullable) */
  @Column({ nullable: true })
  phone?: string;

  /** 연결된 RefreshToken 목록 (1:N) */
  @OneToMany(() => RefreshToken, (token) => token.user, { cascade: true })
  refreshTokens?: RefreshToken[];

  /** 비밀번호 변경 이력 목록 (1:N) */
  @OneToMany(() => PasswordHistory, (history) => history.user, { cascade: true })
  passwordHistories?: PasswordHistory[];

  /** 연결된 소셜 계정 목록 (1:N) */
  @OneToMany(() => UserSocialAccount, (account) => account.user, { cascade: true })
  socialAccounts?: UserSocialAccount[];

  /** 연결된 세션 목록 (1:N) */
  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions?: Session[];

  /** 연결된 Role 목록 (N:M) */
  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable()
  roles?: Role[];

  /** 개인정보 수집 동의 여부 */
  @Column({ default: false })
  agreedToPrivacyPolicy: boolean;

  /** 개인정보 수집 동의한 날짜 */
  @Column({ type: 'timestamp', nullable: true })
  privacyAgreementDate?: Date;

  /** 개인정보 수집 동의 만료일 */
  @Column({ type: 'timestamp', nullable: true })
  privacyAgreementExpireAt?: Date;

  /** 생성 일시 */
  @CreateDateColumn()
  createdAt: Date;

  /** 수정 일시 */
  @UpdateDateColumn()
  updatedAt: Date;
}
