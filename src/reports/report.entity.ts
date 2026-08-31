// create a report entity for the reports table in the database
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  price!: number;

  @Column()
  make!: string;

  @Column()
  model!: string;

  @Column()
  year!: number;
  
  @Column()
  latitude!: number;

  @Column()
  longitude!: number;

  @Column()
  mileage!: number;

  @ManyToOne(() => User, (user) => user.reports)
  user!: User
}
