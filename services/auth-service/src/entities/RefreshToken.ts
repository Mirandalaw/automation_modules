import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne(()=>User,(user)=>user.refreshtokens)
  user:User;

  @CreateDateColumn()
  createdAt:Date;

  @Column({type: 'timestamp'})
  expiredAt: Date;

}