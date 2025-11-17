import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  reports_to_id: string | null;

  @Column({ type: 'integer', default: 0 })
  display_order: number;

  @Column('text', { nullable: true })
  profile_image_url: string | null;

  @Column()
  timezone: string;

  // Relação com o gerente (auto-referência)
  @ManyToOne(() => Employee, (employee) => employee.subordinates, {
    nullable: true,
  })
  @JoinColumn({ name: 'reports_to_id' })
  manager: Employee;

  // Relação com subordinados
  @OneToMany(() => Employee, (employee) => employee.manager)
  subordinates: Employee[];
}
