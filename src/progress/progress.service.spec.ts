import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { TopicCompletion } from './entities/topic-completion.entity';
import { CoursesService } from '../courses/courses.service';
import { TopicsService } from '../topics/topics.service';
import { repositoryMockFactory, MockType, mockUser, mockCourse, mockTopic, mockEnrollment, mockTopicCompletion } from '../test-utils/mock-factory';

describe('ProgressService', () => {
  let service: ProgressService;
  let enrollmentRepositoryMock: MockType<Repository<CourseEnrollment>>;
  let completionRepositoryMock: MockType<Repository<TopicCompletion>>;
  let coursesService: jest.Mocked<CoursesService>;
  let topicsService: jest.Mocked<TopicsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(CourseEnrollment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(TopicCompletion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: CoursesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TopicsService,
          useValue: {
            findOne: jest.fn(),
            findByCourse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    enrollmentRepositoryMock = module.get(getRepositoryToken(CourseEnrollment));
    completionRepositoryMock = module.get(getRepositoryToken(TopicCompletion));
    coursesService = module.get(CoursesService);
    topicsService = module.get(TopicsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollInCourse', () => {
    it('should enroll student in course', async () => {
      coursesService.findOne.mockResolvedValue(mockCourse);
      enrollmentRepositoryMock.findOne?.mockResolvedValue(null);
      enrollmentRepositoryMock.create?.mockReturnValue(mockEnrollment);
      enrollmentRepositoryMock.save?.mockResolvedValue(mockEnrollment);

      const result = await service.enrollInCourse('course-1', mockUser);

      expect(coursesService.findOne).toHaveBeenCalledWith('course-1');
      expect(enrollmentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { courseId: 'course-1', studentId: mockUser.id },
      });
      expect(enrollmentRepositoryMock.create).toHaveBeenCalledWith({
        courseId: 'course-1',
        studentId: mockUser.id,
      });
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw ConflictException if already enrolled', async () => {
      coursesService.findOne.mockResolvedValue(mockCourse);
      enrollmentRepositoryMock.findOne?.mockResolvedValue(mockEnrollment);

      await expect(service.enrollInCourse('course-1', mockUser))
        .rejects.toThrow(ConflictException);

      expect(coursesService.findOne).toHaveBeenCalledWith('course-1');
      expect(enrollmentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { courseId: 'course-1', studentId: mockUser.id },
      });
      expect(enrollmentRepositoryMock.create).not.toHaveBeenCalled();
      expect(enrollmentRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw error if course does not exist', async () => {
      const error = new NotFoundException('Course not found');
      coursesService.findOne.mockRejectedValue(error);

      await expect(service.enrollInCourse('course-1', mockUser))
        .rejects.toThrow(NotFoundException);

      expect(coursesService.findOne).toHaveBeenCalledWith('course-1');
      expect(enrollmentRepositoryMock.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getStudentEnrollments', () => {
    it('should return student enrollments', async () => {
      const mockEnrollments = [mockEnrollment];
      enrollmentRepositoryMock.find?.mockResolvedValue(mockEnrollments);

      const result = await service.getStudentEnrollments('user-1');

      expect(enrollmentRepositoryMock.find).toHaveBeenCalledWith({
        where: { studentId: 'user-1' },
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
      expect(result).toEqual(mockEnrollments);
    });

    it('should return empty array if no enrollments found', async () => {
      enrollmentRepositoryMock.find?.mockResolvedValue([]);

      const result = await service.getStudentEnrollments('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getCourseProgress', () => {
    it('should return course progress with topics', async () => {
      const enrollmentWithCompletions = {
        ...mockEnrollment,
        topicCompletions: [mockTopicCompletion],
        progressPercentage: 50
      };
      const mockTopics = [mockTopic, { ...mockTopic, id: 'topic-2' }];

      enrollmentRepositoryMock.findOne?.mockResolvedValue(enrollmentWithCompletions);
      topicsService.findByCourse.mockResolvedValue(mockTopics);

      const result = await service.getCourseProgress('course-1', 'user-1');

      expect(enrollmentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { courseId: 'course-1', studentId: 'user-1' },
        relations: ['course', 'topicCompletions', 'topicCompletions.topic'],
      });
      expect(topicsService.findByCourse).toHaveBeenCalledWith('course-1');
      expect(result).toEqual({
        enrollment: enrollmentWithCompletions,
        totalTopics: 2,
        completedTopics: 1,
        progressPercentage: 50,
        topics: [
          {
            ...mockTopic,
            completed: true,
            completedAt: mockTopicCompletion.completedAt,
          },
          {
            ...mockTopic,
            id: 'topic-2',
            completed: false,
            completedAt: undefined,
          }
        ]
      });
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      enrollmentRepositoryMock.findOne?.mockResolvedValue(null);

      await expect(service.getCourseProgress('course-1', 'user-1'))
        .rejects.toThrow(NotFoundException);

      expect(enrollmentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { courseId: 'course-1', studentId: 'user-1' },
        relations: ['course', 'topicCompletions', 'topicCompletions.topic'],
      });
    });

    it('should handle course with no topics', async () => {
      const enrollmentWithNoCompletions = {
        ...mockEnrollment,
        topicCompletions: [],
        progressPercentage: 0
      };

      enrollmentRepositoryMock.findOne?.mockResolvedValue(enrollmentWithNoCompletions);
      topicsService.findByCourse.mockResolvedValue([]);

      const result = await service.getCourseProgress('course-1', 'user-1');

      expect(result).toEqual({
        enrollment: enrollmentWithNoCompletions,
        totalTopics: 0,
        completedTopics: 0,
        progressPercentage: 0,
        topics: []
      });
    });
  });

  describe('markTopicComplete', () => {
    it('should mark topic as complete', async () => {
      const enrollmentWithCompletions = {
        ...mockEnrollment,
        topicCompletions: []
      };

      topicsService.findOne.mockResolvedValue(mockTopic);
      enrollmentRepositoryMock.findOne?.mockResolvedValue(enrollmentWithCompletions);
      completionRepositoryMock.findOne?.mockResolvedValue(null);
      completionRepositoryMock.create?.mockReturnValue(mockTopicCompletion);
      completionRepositoryMock.save?.mockResolvedValue(mockTopicCompletion);
      
      // Mock for updateCourseProgress
      const updatedEnrollment = {
        ...enrollmentWithCompletions,
        topicCompletions: [mockTopicCompletion]
      };
      enrollmentRepositoryMock.findOne?.mockResolvedValueOnce(enrollmentWithCompletions)
        .mockResolvedValueOnce(updatedEnrollment);
      topicsService.findByCourse.mockResolvedValue([mockTopic]);
      enrollmentRepositoryMock.update?.mockResolvedValue({ affected: 1 } as any);

      const result = await service.markTopicComplete('topic-1', mockUser);

      expect(topicsService.findOne).toHaveBeenCalledWith('topic-1');
      expect(enrollmentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { courseId: 'course-1', studentId: 'user-1' },
        relations: ['topicCompletions']
      });
      expect(completionRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { topicId: 'topic-1', studentId: 'user-1' }
      });
      expect(completionRepositoryMock.create).toHaveBeenCalledWith({
        topicId: 'topic-1',
        studentId: 'user-1',
        enrollmentId: 'enrollment-1'
      });
      expect(completionRepositoryMock.save).toHaveBeenCalledWith(mockTopicCompletion);
      expect(result).toEqual(mockTopicCompletion);
    });

    it('should return existing completion if already completed', async () => {
      const enrollmentWithCompletions = {
        ...mockEnrollment,
        topicCompletions: [mockTopicCompletion]
      };

      topicsService.findOne.mockResolvedValue(mockTopic);
      enrollmentRepositoryMock.findOne?.mockResolvedValue(enrollmentWithCompletions);
      completionRepositoryMock.findOne?.mockResolvedValue(mockTopicCompletion);

      const result = await service.markTopicComplete('topic-1', mockUser);

      expect(completionRepositoryMock.create).not.toHaveBeenCalled();
      expect(completionRepositoryMock.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockTopicCompletion);
    });

    it('should throw NotFoundException if not enrolled in course', async () => {
      topicsService.findOne.mockResolvedValue(mockTopic);
      enrollmentRepositoryMock.findOne?.mockResolvedValue(null);

      await expect(service.markTopicComplete('topic-1', mockUser))
        .rejects.toThrow(NotFoundException);

      expect(topicsService.findOne).toHaveBeenCalledWith('topic-1');
      expect(enrollmentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { courseId: 'course-1', studentId: 'user-1' },
        relations: ['topicCompletions']
      });
      expect(completionRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should throw error if topic does not exist', async () => {
      const error = new NotFoundException('Topic not found');
      topicsService.findOne.mockRejectedValue(error);

      await expect(service.markTopicComplete('topic-1', mockUser))
        .rejects.toThrow(NotFoundException);

      expect(topicsService.findOne).toHaveBeenCalledWith('topic-1');
      expect(enrollmentRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it('should update course progress to 100% when all topics completed', async () => {
      const enrollmentWithCompletions = {
        ...mockEnrollment,
        topicCompletions: []
      };

      topicsService.findOne.mockResolvedValue(mockTopic);
      enrollmentRepositoryMock.findOne?.mockResolvedValue(enrollmentWithCompletions);
      completionRepositoryMock.findOne?.mockResolvedValue(null);
      completionRepositoryMock.create?.mockReturnValue(mockTopicCompletion);
      completionRepositoryMock.save?.mockResolvedValue(mockTopicCompletion);
      
      // Mock for updateCourseProgress - single topic course, so 100% completion
      const updatedEnrollment = {
        ...enrollmentWithCompletions,
        topicCompletions: [mockTopicCompletion]
      };
      enrollmentRepositoryMock.findOne?.mockResolvedValueOnce(enrollmentWithCompletions)
        .mockResolvedValueOnce(updatedEnrollment);
      topicsService.findByCourse.mockResolvedValue([mockTopic]); // Only one topic
      enrollmentRepositoryMock.update?.mockResolvedValue({ affected: 1 } as any);

      await service.markTopicComplete('topic-1', mockUser);

      expect(enrollmentRepositoryMock.update).toHaveBeenCalledWith('enrollment-1', {
        progressPercentage: 100,
        completed: true,
      });
    });
  });
});