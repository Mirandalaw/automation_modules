import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { PasswordHistory } from './PasswordHistory';
import { UserSocialAccount } from './UserSocialAccount';
import { RefreshToken } from './RefreshToken';
import { Role } from './Role';


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  phone?: string;

  // @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  // @JoinTable() // 소유 측 (User → Role)
  // roles: Role[];

  @OneToMany(() => RefreshToken, (token) => token.user, { cascade: true })
  refreshTokens?: RefreshToken[];

  // ✅ 비밀번호 변경 이력 (1:N)
  @OneToMany(() => PasswordHistory, (history) => history.user, { cascade: true })
  passwordHistories: PasswordHistory[];

  // ✅ 연결된 소셜 계정 목록 (1:N)
  @OneToMany(() => UserSocialAccount, (account) => account.user, { cascade: true })
  socialAccounts: UserSocialAccount[];

  // ✅ 개인정보 수집 동의 여부 및 날짜
  @Column({ default: false })
  agreedToPrivacyPolicy: boolean;

  @Column({ type: 'timestamp', nullable: true })
  privacyAgreementDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  privacyAgreementExpireAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}