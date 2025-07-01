import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

describe('TopicsController', () => {
  let controller: TopicsController;
  let topicsService: TopicsService;

  const mockTopicsService = {
    create: jest.fn(),
    findByCourse: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'tutor@example.com',
    firstName: 'Test Tutor',
    lastName: 'sample',
    role: UserRole.TUTOR
  };

  const mockUserRequest = {
    user: mockUser
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [
        {
          provide: TopicsService,
          useValue: mockTopicsService,
        },
      ],
    }).compile();

    controller = module.get<TopicsController>(TopicsController);
    topicsService = module.get<TopicsService>(TopicsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a topic for a specific course', async () => {
      const courseId = 'course-123';
      const createTopicDto: CreateTopicDto = {
        title: 'Introduction to Programming',
        content: "Course content",
        description: 'Basic programming concepts',
        order: 1,
        duration: 60
      };

      const expectedResult = {
        id: 'topic-1',
        courseId: courseId,
        ...createTopicDto,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockTopicsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(courseId, createTopicDto, mockUserRequest);
      expect(topicsService.create).toHaveBeenCalledWith(courseId, createTopicDto, mockUser);
      expect(topicsService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle creation errors', async () => {
      const courseId = 'course-123';
      const createTopicDto: CreateTopicDto = {
        title: 'Introduction to Programming',
        content: "Course content",
        description: 'Basic programming concepts',
        order: 1,
        duration: 60
      };

      const error = new Error('Topic creation failed');
      mockTopicsService.create.mockRejectedValue(error);
      await expect(controller.create(courseId, createTopicDto, mockUserRequest)).rejects.toThrow(error);
      expect(topicsService.create).toHaveBeenCalledWith(courseId, createTopicDto, mockUser);
    });

    it('should validate courseId parameter', async () => {
      const courseId = 'invalid-course';
      const createTopicDto: CreateTopicDto = {
        title: 'Test Topic',
        content: "Course content",
        description: 'Test Description',
        order: 1,
        duration: 30,
      };

      const error = new Error('Course not found');
      mockTopicsService.create.mockRejectedValue(error);

      await expect(controller.create(courseId, createTopicDto, mockUserRequest)).rejects.toThrow(error);
      expect(topicsService.create).toHaveBeenCalledWith(courseId, createTopicDto, mockUser);
    });
  });

  describe('findByCourse', () => {
    it('should return all topics for a specific course', async () => {
      const courseId = 'course-123';
      const expectedTopics = [
        {
          id: 'topic-1',
          courseId: courseId,
          title: 'Topic 1',
          order: 1,
          duration: 30
        },
        {
          id: 'topic-2',
          courseId: courseId,
          title: 'Topic 2',
          order: 2,
          duration: 45
        },
      ];

      mockTopicsService.findByCourse.mockResolvedValue(expectedTopics);
      const result = await controller.findByCourse(courseId);

      expect(topicsService.findByCourse).toHaveBeenCalledWith(courseId);
      expect(topicsService.findByCourse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedTopics);
    });

    it('should handle empty course topics', async () => {
      const courseId = 'course-empty';
      const expectedTopics = [];

      mockTopicsService.findByCourse.mockResolvedValue(expectedTopics);
      const result = await controller.findByCourse(courseId);

      expect(topicsService.findByCourse).toHaveBeenCalledWith(courseId);
      expect(result).toEqual(expectedTopics);
    });

    it('should handle course not found error', async () => {
      const courseId = 'nonexistent-course';
      const error = new Error('Course not found');

      mockTopicsService.findByCourse.mockRejectedValue(error);
      await expect(controller.findByCourse(courseId)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return a single topic by id', async () => {
      const topicId = 'topic-123';
      const expectedTopic = {
        id: topicId,
        courseId: 'course-456',
        title: 'Advanced Programming',
        content: "Course content",
        description: 'Advanced concepts',
        order: 3,
        duration: 90
      };

      mockTopicsService.findOne.mockResolvedValue(expectedTopic);
      const result = await controller.findOne(topicId);

      expect(topicsService.findOne).toHaveBeenCalledWith(topicId);
      expect(topicsService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedTopic);
    });

    it('should handle topic not found', async () => {
      const topicId = 'nonexistent-topic';
      const error = new Error('Topic not found');

      mockTopicsService.findOne.mockRejectedValue(error);
      await expect(controller.findOne(topicId)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a topic', async () => {
      const topicId = 'topic-123';
      const updateTopicDto: UpdateTopicDto = {
        title: 'Updated Topic Title',
        duration: 120,
      };

      const expectedResult = {
        id: topicId,
        courseId: 'course-456',
        title: 'Updated Topic Title',
        content: "Course content",
        description: 'Original description',
        order: 1,
        duration: 120,
        updatedAt: new Date()
      };

      mockTopicsService.update.mockResolvedValue(expectedResult);
      const result = await controller.update(topicId, updateTopicDto, mockUserRequest);
      expect(topicsService.update).toHaveBeenCalledWith(topicId, updateTopicDto, mockUser);
      expect(topicsService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should allow admin to update any topic', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const adminRequest = { user: adminUser };
      const topicId = 'topic-123';
      const updateTopicDto: UpdateTopicDto = {
        title: 'Admin Updated Topic',
      };

      const expectedResult = {
        id: topicId,
        title: 'Admin Updated Topic',
        updatedAt: new Date()
      };

      mockTopicsService.update.mockResolvedValue(expectedResult);
      const result = await controller.update(topicId, updateTopicDto, adminRequest);
      expect(topicsService.update).toHaveBeenCalledWith(topicId, updateTopicDto, adminUser);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a topic', async () => {
      const topicId = 'topic-123';

      mockTopicsService.remove.mockResolvedValue({});
      const result = await controller.remove(topicId, mockUserRequest);

      expect(topicsService.remove).toHaveBeenCalledWith(topicId, mockUser);
      expect(topicsService.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });

    it('should allow admin to delete any topic', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const adminRequest = { user: adminUser };
      const topicId = 'topic-123';

      mockTopicsService.remove.mockResolvedValue({});

      const result = await controller.remove(topicId, adminRequest);
      expect(topicsService.remove).toHaveBeenCalledWith(topicId, adminUser);
      expect(result).toEqual({});
    });
  });
});