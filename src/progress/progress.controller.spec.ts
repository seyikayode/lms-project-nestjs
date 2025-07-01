import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserRole } from 'src/common/enums/user-role.enum';

describe('ProgressController', () => {
  let controller: ProgressController;
  let progressService: ProgressService;

  const mockProgressService = {
    enrollInCourse: jest.fn(),
    getStudentEnrollments: jest.fn(),
    getCourseProgress: jest.fn(),
    markTopicComplete: jest.fn(),
  };

  const mockStudent = {
    id: '1',
    email: 'student@example.com',
    firstName: 'Test Student',
    lastName: 'Sample',
    role: UserRole.STUDENT,
  };

  const mockUserRequest = {
    user: mockStudent
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        {
          provide: ProgressService,
          useValue: mockProgressService
        },
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
    progressService = module.get<ProgressService>(ProgressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('enrollInCourse', () => {
    it('should enroll student in a course', async () => {
      const courseId = 'course-123';
      const expectedResult = {
        id: 'enrollment-1',
        studentId: mockStudent.id,
        courseId: courseId,
        progressPercentage: 0,
        enrolledAt: new Date()
      };

      mockProgressService.enrollInCourse.mockResolvedValue(expectedResult);
      const result = await controller.enrollInCourse(courseId, mockUserRequest);

      expect(progressService.enrollInCourse).toHaveBeenCalledWith(courseId, mockStudent);
      expect(progressService.enrollInCourse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle enrollment errors', async () => {
      const courseId = 'course-123';
      const error = new Error('Course not found');
      mockProgressService.enrollInCourse.mockRejectedValue(error);

      await expect(controller.enrollInCourse(courseId, mockUserRequest)).rejects.toThrow(error);
      expect(progressService.enrollInCourse).toHaveBeenCalledWith(courseId, mockStudent);
    });

    it('should handle duplicate enrollment', async () => {
      const courseId = 'course-123';
      const error = new Error('Already enrolled in this course');

      mockProgressService.enrollInCourse.mockRejectedValue(error);
      await expect(controller.enrollInCourse(courseId, mockUserRequest)).rejects.toThrow(error);
      expect(progressService.enrollInCourse).toHaveBeenCalledWith(courseId, mockStudent);
    });
  });

  describe('getMyEnrollments', () => {
    it('should return student enrollments', async () => {
      const expectedEnrollments = [
        {
          id: 'enrollment-1',
          studentId: mockStudent.id,
          courseId: 'course-1',
          course: {
            id: 'course-1',
            title: 'JavaScript Basics',
            description: 'Learn JavaScript fundamentals',
          },
          progressPercentage: 25,
          enrolledAt: new Date()
        },
        {
          id: 'enrollment-2',
          studentId: mockStudent.id,
          courseId: 'course-2',
          course: {
            id: 'course-2',
            title: 'React Advanced',
            description: 'Advanced React concepts',
          },
          progressPercentage: 60,
          enrolledAt: new Date()
        },
      ];

      mockProgressService.getStudentEnrollments.mockResolvedValue(expectedEnrollments);
      const result = await controller.getMyEnrollments(mockUserRequest);

      expect(progressService.getStudentEnrollments).toHaveBeenCalledWith(mockStudent.id);
      expect(progressService.getStudentEnrollments).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedEnrollments);
      expect(result).toHaveLength(2);
    });

    it('should handle student with no enrollments', async () => {
      const expectedEnrollments = [];
      mockProgressService.getStudentEnrollments.mockResolvedValue(expectedEnrollments)

      const result = await controller.getMyEnrollments(mockUserRequest);
      expect(result).toEqual(expectedEnrollments);
    });

    it('should include course details in enrollments', async () => {
      const expectedEnrollments = [
        {
          id: 'enrollment-1',
          progressPercentage: 75,
          course: {
            id: 'course-1',
            title: 'Python Programming',
            tutor: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        },
      ];

      mockProgressService.getStudentEnrollments.mockResolvedValue(expectedEnrollments);
      const result = await controller.getMyEnrollments(mockUserRequest);
      
      expect(result[0]).toHaveProperty('course');
      expect(result[0].course).toHaveProperty('title');
      expect(result[0]).toHaveProperty('progressPercentage');
    });
  });
});