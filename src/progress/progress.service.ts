import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { Repository } from 'typeorm';
import { TopicCompletion } from './entities/topic-completion.entity';
import { CoursesService } from 'src/courses/courses.service';
import { TopicsService } from 'src/topics/topics.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(TopicCompletion)
    private completionRepository: Repository<TopicCompletion>,
    private coursesService: CoursesService,
    private topicsService: TopicsService
  ) {}

  async enrollInCourse(courseId: string, student: User): Promise<CourseEnrollment> {
    await this.coursesService.findOne(courseId);

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { courseId, studentId: student.id }
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({
      courseId,
      studentId: student.id,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async getStudentEnrollments(studentId: string): Promise<CourseEnrollment[]> {
    return this.enrollmentRepository.find({
      where: { studentId },
      relations: ['course', 'course.tutor', 'topicCompletions'],
      select: {
        course: {
          id: true,
          title: true,
          description: true,
          image: true,
          tutor: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
  }

  async getCourseProgress(courseId: string, studentId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { courseId, studentId },
      relations: ['course', 'topicCompletions', 'topicCompletions.topic'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const topics = await this.topicsService.findByCourse(courseId);
    const completedTopics = enrollment.topicCompletions;

    return {
      enrollment,
      totalTopics: topics.length,
      completedTopics: completedTopics.length,
      progressPercentage: enrollment.progressPercentage,
      topics: topics.map(topic => ({
        ...topic,
        completed: completedTopics.some(completion => completion.topicId === topic.id),
        completedAt: completedTopics.find(completion => completion.topicId === topic.id)?.completedAt,
      }))
    };
  }

  async markTopicComplete(topicId: string, student: User): Promise<TopicCompletion> {
    const topic = await this.topicsService.findOne(topicId);

    const enrollment = await this.enrollmentRepository.findOne({
      where: { courseId: topic.courseId, studentId: student.id },
      relations: ['topicCompletions']
    });
    if (!enrollment) {
      throw new NotFoundException('You must be enrolled in the course to complete topics');
    }

    const existingCompletion = await this.completionRepository.findOne({
      where: { topicId, studentId: student.id }
    });
    if (existingCompletion) {
      return existingCompletion;
    }

    const completion = this.completionRepository.create({
      topicId,
      studentId: student.id,
      enrollmentId: enrollment.id
    });
    const savedCompletion = await this.completionRepository.save(completion);

    await this.updateCourseProgress(enrollment.id);

    return savedCompletion;
  }

  private async updateCourseProgress(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['topicCompletions']
    });
    if (!enrollment) {
      throw new NotFoundException('course enrollment not found');
    }

    const totalTopics = await this.topicsService.findByCourse(enrollment.courseId);
    const completedCount = enrollment.topicCompletions.length;
    const progressPercentage = totalTopics.length > 0 ? Math.round((completedCount / totalTopics.length) * 100) : 0;

    await this.enrollmentRepository.update(enrollmentId, {
      progressPercentage,
      completed: progressPercentage === 100,
    });
  }
}
