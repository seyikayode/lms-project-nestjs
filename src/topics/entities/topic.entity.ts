import { Course } from "src/courses/entities/course.entity";
import { TopicCompletion } from "src/progress/entities/topic-completion.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('topics')
export class Topic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column('text')
    description: string;

    @Column({ type: 'integer', default: 0 })
    duration: number; // in minutes

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    video: string;

    @Column({ type: 'integer', default: 0 })
    order: number;

    @ManyToOne(() => Course, course => course.topics, { onDelete: 'CASCADE' })
    course: Course;

    @Column()
    courseId: string;

    @OneToMany(() => TopicCompletion, completion => completion.topic)
    completions: TopicCompletion[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
