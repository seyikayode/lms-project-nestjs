import { CourseEnrollment } from "src/progress/entities/course-enrollment.entity";
import { Topic } from "src/topics/entities/topic.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({ nullable: true })
    image: string;

    @ManyToOne(() => User, user => user.courses)
    tutor: User;

    @Column()
    tutorId: string;

    @OneToMany(() => Topic, topic => topic.course, { cascade: true })
    topics: Topic[];

    @OneToMany(() => CourseEnrollment, enrollment => enrollment.course)
    enrollments: CourseEnrollment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
