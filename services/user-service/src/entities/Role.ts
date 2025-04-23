// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToMany,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { User } from './User';
//
// @Entity()
// export class Role {
//   @PrimaryGeneratedColumn()
//   id: number;
//
//   @Column({ unique: true })
//   name: string; // 예: 'USER', 'ADMIN', 'MANAGER'
//
//   // @ManyToMany(() => User, (user) => user.roles)
//   // users: User[];
//
//   @CreateDateColumn()
//   createdAt: Date;
//
//   @UpdateDateColumn()
//   updatedAt: Date;
// }
