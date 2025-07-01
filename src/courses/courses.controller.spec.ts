import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: CoursesService;

  const mockCoursesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByTutor: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
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
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    coursesService = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a course with authenticated tutor', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        image: '',
      };

      const expectedResult = {
        id: '1',
        ...createCourseDto,
        tutorId: mockUser.id
      };

      mockCoursesService.create.mockResolvedValue(expectedResult);
      const result = await controller.create(createCourseDto, mockUserRequest);

      expect(coursesService.create).toHaveBeenCalledWith(createCourseDto, mockUser);
      expect(coursesService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle creation errors', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        image: ''
      };

      const error = new Error('Course creation failed');
      mockCoursesService.create.mockRejectedValue(error);

      await expect(controller.create(createCourseDto, mockUserRequest)).rejects.toThrow(error);
      expect(coursesService.create).toHaveBeenCalledWith(createCourseDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      const expectedCourses = [
        {
          id: '1',
          title: 'Course 1',
          description: 'Description 1',
          image: ''
        },
        {
          id: '2',
          title: 'Course 2',
          description: 'Description 2',
          image: ''
        },
      ];

      mockCoursesService.findAll.mockResolvedValue(expectedCourses);
      const result = await controller.findAll();

      expect(coursesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCourses);
    });

    it('should handle findAll errors', async () => {
      const error = new Error('Failed to fetch courses');
      mockCoursesService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
    });
  });

  describe('findMyCourses', () => {
    it('should return courses for authenticated tutor', async () => {
      const expectedCourses = [
        {
          id: '1',
          title: 'My Course 1',
          tutorId: mockUser.id,
        },
        {
          id: '2',
          title: 'My Course 2',
          tutorId: mockUser.id,
        },
      ];

      mockCoursesService.findByTutor.mockResolvedValue(expectedCourses);
      const result = await controller.findMyCourses(mockUserRequest);

      expect(coursesService.findByTutor).toHaveBeenCalledWith(mockUser.id);
      expect(coursesService.findByTutor).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCourses);
    });

    it('should handle findMyCourses errors', async () => {
      const error = new Error('Failed to fetch tutor courses');
      mockCoursesService.findByTutor.mockRejectedValue(error);

      await expect(controller.findMyCourses(mockUserRequest)).rejects.toThrow(error);
      expect(coursesService.findByTutor).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a single course by id', async () => {
      const courseId = '1';
      const expectedCourse = {
        id: courseId,
        title: 'Test Course',
        description: 'Test Description',
        image: '',
      };

      mockCoursesService.findOne.mockResolvedValue(expectedCourse);
      const result = await controller.findOne(courseId);

      expect(coursesService.findOne).toHaveBeenCalledWith(courseId);
      expect(coursesService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCourse);
    });

    it('should handle course not found', async () => {
      const courseId = 'nonexistent';
      const error = new Error('Course not found');

      mockCoursesService.findOne.mockRejectedValue(error);
      await expect(controller.findOne(courseId)).rejects.toThrow(error);
      expect(coursesService.findOne).toHaveBeenCalledWith(courseId);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const courseId = '1';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
        description: 'Original Description',
        image: '',
      };

      const expectedResult = {
        id: courseId,
        title: 'Updated Course',
        description: 'Original Description',
        image: ''
      };

      mockCoursesService.update.mockResolvedValue(expectedResult);
      const result = await controller.update(courseId, updateCourseDto, mockUserRequest);

      expect(coursesService.update).toHaveBeenCalledWith(courseId, updateCourseDto, mockUser);
      expect(coursesService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should allow admin to update any course', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const adminRequest = { user: adminUser };
      const courseId = '1';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Admin Updated Course',
        description: 'Admin Updated Description',
        image: ''
      };

      const expectedResult = {
        id: courseId,
        title: 'Admin Updated Course',
        description: 'Admin Updated Description',
        image: ''
      };

      mockCoursesService.update.mockResolvedValue(expectedResult);
      const result = await controller.update(courseId, updateCourseDto, adminRequest);
      expect(coursesService.update).toHaveBeenCalledWith(courseId, updateCourseDto, adminUser);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a course', async () => {
      const courseId = '1';
      const expectedResult = { message: 'Course deleted successfully' };
      mockCoursesService.remove.mockResolvedValue({});

      const result = await controller.remove(courseId, mockUserRequest);
      expect(result).toEqual({});
      expect(coursesService.remove).toHaveBeenCalledWith(courseId, mockUser);
      expect(coursesService.remove).toHaveBeenCalledTimes(1);
    });

    it('should allow admin to delete any course', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const adminRequest = { user: adminUser };
      const courseId = '1';
      const expectedResult = { message: 'Course deleted successfully' };
      mockCoursesService.remove.mockResolvedValue({});

      const result = await controller.remove(courseId, adminRequest);
      expect(result).toEqual({});
      expect(coursesService.remove).toHaveBeenCalledWith(courseId, adminUser);
    });
  });
});