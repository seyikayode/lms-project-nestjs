import { Exclude } from "class-transformer";
import { UserRole } from "src/common/enums/user-role.enum";
import { Course } from "src/courses/entities/course.entity";
import { CourseEnrollment } from "src/progress/entities/course-enrollment.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    email: string

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT
    })
    role: UserRole;

    @Column({ nullable: true })
    profileImage: string;

    @OneToMany(() => Course, course => course.tutor)
    courses: Course[]

    @OneToMany(() => CourseEnrollment, enrollment => enrollment.student)
    enrollments: CourseEnrollment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
