import { Course } from "src/courses/entities/course.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TopicCompletion } from "./topic-completion.entity";

@Entity('course_enrollments')
export class CourseEnrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.enrollments)
    student: User;

    @Column()
    studentId: string;

    @ManyToOne(() => Course, course => course.enrollments)
    course: Course;

    @Column()
    courseId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    progressPercentage: number;

    @Column({ default: false })
    completed: boolean

    @OneToMany(() => TopicCompletion, completion => completion.enrollment)
    topicCompletions: TopicCompletion[]

    @CreateDateColumn()
    enrolledAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}