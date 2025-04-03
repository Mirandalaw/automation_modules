import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne(()=>User,(user)=>user.refreshtokens)
  @JoinColumn({name : 'userUUID',referencedColumnName : 'uuid'})
  user:User;

  @Column()
  userUUID : string;

  @CreateDateColumn()
  createdAt:Date;

  @Column({type: 'timestamp'})
  expiredAt: Date;

}