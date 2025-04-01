import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import BaseEntity from './Entitiy';
import { RefreshToken } from './RefreshToken';
import { Role } from './Role';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  // ✅ 관계 필드는 기본적으로 optional이며, nullable 처리도 자동
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles?: Role[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshtokens?: RefreshToken[];
}
