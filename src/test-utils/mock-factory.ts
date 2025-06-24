import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Topic } from '../topics/entities/topic.entity';
import { CourseEnrollment } from '../progress/entities/course-enrollment.entity';
import { TopicCompletion } from '../progress/entities/topic-completion.entity';
import { UserRole } from '../common/enums/user-role.enum';


export type MockType<T> = {
    [P in keyof T]?: jest.Mock<any>;
};
  
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn()
}));
  
export const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    role: UserRole.STUDENT,
    profileImage: '',
    courses: [],
    enrollments: [],
    createdAt: new Date(),
    updatedAt: new Date()
};
  
export const mockTutor: User = {
    id: 'tutor-1',
    email: 'tutor@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    password: 'hashedPassword',
    role: UserRole.TUTOR,
    profileImage: '',
    courses: [],
    enrollments: [],
    createdAt: new Date(),
    updatedAt: new Date()
};
  
export const mockCourse: Course = {
    id: 'course-1',
    title: 'Test Course',
    description: 'Test Description',
    image: 'test-image.jpg',
    tutor: mockTutor,
    tutorId: 'tutor-1',
    topics: [],
    enrollments: [],
    createdAt: new Date(),
    updatedAt: new Date()
};
  
export const mockTopic: Topic = {
    id: 'topic-1',
    title: 'Test Topic',
    content: 'Test Content',
    description: 'Test Description',
    duration: 30,
    image: 'topic-image.jpg',
    video: 'topic-video.mp4',
    order: 1,
    course: mockCourse,
    courseId: 'course-1',
    completions: [],
    createdAt: new Date(),
    updatedAt: new Date()
};
  
export const mockEnrollment: CourseEnrollment = {
    id: 'enrollment-1',
    student: mockUser,
    studentId: 'user-1',
    course: mockCourse,
    courseId: 'course-1',
    progressPercentage: 0,
    completed: false,
    topicCompletions: [],
    enrolledAt: new Date(),
    updatedAt: new Date()
};
  
export const mockTopicCompletion: TopicCompletion = {
    id: 'completion-1',
    student: mockUser,
    studentId: 'user-1',
    topic: mockTopic,
    topicId: 'topic-1',
    enrollment: mockEnrollment,
    enrollmentId: 'enrollment-1',
    completedAt: new Date()
};