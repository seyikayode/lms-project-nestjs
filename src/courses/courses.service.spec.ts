import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { repositoryMockFactory, MockType, mockCourse, mockTutor, mockUser } from '../test-utils/mock-factory';

describe('CoursesService', () => {
  let service: CoursesService;
  let repositoryMock: MockType<Repository<Course>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    repositoryMock = module.get(getRepositoryToken(Course));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        image: 'test-image.jpg',
      };

      repositoryMock.create?.mockReturnValue(mockCourse);
      repositoryMock.save?.mockResolvedValue(mockCourse);

      const result = await service.create(createCourseDto, mockTutor);

      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...createCourseDto,
        tutorId: mockTutor.id,
      });
      expect(repositoryMock.save).toHaveBeenCalledWith(mockCourse);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('findAll', () => {
    it('should return all courses with relations', async () => {
      const courses = [mockCourse];
      repositoryMock.find?.mockResolvedValue(courses);

      const result = await service.findAll();

      expect(repositoryMock.find).toHaveBeenCalledWith({
        relations: ['tutor', 'topics'],
        select: {
          tutor: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      });
      expect(result).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      repositoryMock.findOne?.mockResolvedValue(mockCourse);

      const result = await service.findOne('course-1');

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        relations: ['tutor', 'topics'],
        select: {
          tutor: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      });
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      repositoryMock.findOne?.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTutor', () => {
    it('should return courses by tutor id', async () => {
      const courses = [mockCourse];
      repositoryMock.find?.mockResolvedValue(courses);

      const result = await service.findByTutor('tutor-1');

      expect(repositoryMock.find).toHaveBeenCalledWith({
        where: { tutorId: 'tutor-1' },
        relations: ['topics'],
      });
      expect(result).toEqual(courses);
    });
  });

  describe('update', () => {
    it('should update course if user is owner', async () => {
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Test desc'
      };

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce({ ...mockCourse, ...updateCourseDto });
      repositoryMock.update?.mockResolvedValue(undefined);

      const result = await service.update('course-1', updateCourseDto, mockTutor);

      expect(repositoryMock.update).toHaveBeenCalledWith('course-1', updateCourseDto);
      expect(result.title).toBe('Updated Course');
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Test desc'
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockCourse);

      await expect(service.update('course-1', updateCourseDto, mockUser))
        .rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any course', async () => {
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Test desc'
      };

      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce({ ...mockCourse, ...updateCourseDto });
      repositoryMock.update?.mockResolvedValue(undefined);

      const result = await service.update('course-1', updateCourseDto, adminUser);

      expect(repositoryMock.update).toHaveBeenCalledWith('course-1', updateCourseDto);
      expect(result.title).toBe('Updated Course');
    });
  });

  describe('remove', () => {
    it('should remove course if user is owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCourse);
      repositoryMock.delete?.mockResolvedValue(undefined);

      await service.remove('course-1', mockTutor);

      expect(repositoryMock.delete).toHaveBeenCalledWith('course-1');
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCourse);

      await expect(service.remove('course-1', mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });
});