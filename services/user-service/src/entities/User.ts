import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSocialAccount } from './UserSocialAccount';

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

  @OneToMany(() => UserSocialAccount, (account) => account.user, { cascade: true })
  socialAccounts: UserSocialAccount[];

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
