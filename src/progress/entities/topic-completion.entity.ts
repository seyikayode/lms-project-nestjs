import { Topic } from "src/topics/entities/topic.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CourseEnrollment } from "./course-enrollment.entity";

@Entity('topic_completions')
export class TopicCompletion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    student: User;

    @Column()
    studentId: string;

    @ManyToOne(() => Topic, topic => topic.completions)
    topic: Topic;

    @Column()
    topicId: string;

    @ManyToOne(() => CourseEnrollment, enrollment => enrollment.topicCompletions)
    enrollment: CourseEnrollment;

    @Column()
    enrollmentId: string;

    @CreateDateColumn()
    completedAt: Date;
}