import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('users')
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;  // 암호화된 비밀번호를 저장

  // 필요한 경우, 다른 필드 (예: createdAt, updatedAt) 등을 추가
}
