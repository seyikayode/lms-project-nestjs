import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { Topic } from './entities/topic.entity';
import { CoursesService } from '../courses/courses.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { repositoryMockFactory, MockType, mockTopic, mockCourse, mockTutor, mockUser } from '../test-utils/mock-factory';

describe('TopicsService', () => {
  let service: TopicsService;
  let repositoryMock: MockType<Repository<Topic>>;
  let coursesService: jest.Mocked<CoursesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        {
          provide: getRepositoryToken(Topic),
          useFactory: repositoryMockFactory,
        },
        {
          provide: CoursesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TopicsService>(TopicsService);
    repositoryMock = module.get(getRepositoryToken(Topic));
    coursesService = module.get(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new topic', async () => {
      const createTopicDto: CreateTopicDto = {
        title: 'Test Topic',
        content: 'Test Content',
        description: 'Test Description',
        duration: 30,
        order: 1
      };

      coursesService.findOne.mockResolvedValue(mockCourse);
      repositoryMock.create?.mockReturnValue(mockTopic);
      repositoryMock.save?.mockResolvedValue(mockTopic);

      const result = await service.create('course-1', createTopicDto, mockTutor);

      expect(coursesService.findOne).toHaveBeenCalledWith('course-1');
      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...createTopicDto,
        courseId: 'course-1',
      });
      expect(repositoryMock.save).toHaveBeenCalledWith(mockTopic);
      expect(result).toEqual(mockTopic);
    });

    it('should throw ForbiddenException if user is not course owner', async () => {
      const createTopicDto: CreateTopicDto = {
        title: 'Test Topic',
        content: 'Test Content',
        description: 'Test Description',
        order: 1
      };

      coursesService.findOne.mockResolvedValue(mockCourse);

      await expect(service.create('course-1', createTopicDto, mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByCourse', () => {
    it('should return topics by course id', async () => {
      const topics = [mockTopic];
      repositoryMock.find?.mockResolvedValue(topics);

      const result = await service.findByCourse('course-1');

      expect(repositoryMock.find).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(topics);
    });
  });

  describe('findOne', () => {
    it('should return a topic by id', async () => {
      repositoryMock.findOne?.mockResolvedValue(mockTopic);

      const result = await service.findOne('topic-1');

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'topic-1' },
        relations: ['course'],
      });
      expect(result).toEqual(mockTopic);
    });

    it('should throw NotFoundException if topic not found', async () => {
      repositoryMock.findOne?.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update topic if user is course owner', async () => {
      const updateTopicDto: UpdateTopicDto = {
        title: 'Updated Topic',
        content: 'Test Content',
        description: 'Test Description',
      };

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockTopic)
        .mockResolvedValueOnce({ ...mockTopic, ...updateTopicDto });
      repositoryMock.update?.mockResolvedValue(undefined);

      const result = await service.update('topic-1', updateTopicDto, mockTutor);

      expect(repositoryMock.update).toHaveBeenCalledWith('topic-1', updateTopicDto);
      expect(result.title).toBe('Updated Topic');
    });

    it('should throw ForbiddenException if user is not course owner', async () => {
      const updateTopicDto: UpdateTopicDto = {
        title: 'Updated Topic',
        content: 'Test Content',
        description: 'Test Description',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockTopic);

      await expect(service.update('topic-1', updateTopicDto, mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove topic if user is course owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTopic);
      repositoryMock.delete?.mockResolvedValue(undefined);

      await service.remove('topic-1', mockTutor);

      expect(repositoryMock.delete).toHaveBeenCalledWith('topic-1');
    });

    it('should throw ForbiddenException if user is not course owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTopic);

      await expect(service.remove('topic-1', mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });
});