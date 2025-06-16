import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>
  ) {}

  async create(createCourseDto: CreateCourseDto, tutor: User): Promise<Course> {
    const course = this.coursesRepository.create({
      ...createCourseDto,
      tutorId: tutor.id
    });
    
    return this.coursesRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find({
      relations: ['tutor', 'topics'],
      select: {
        tutor: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['tutor', 'topics'],
      select: {
        tutor: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findByTutor(tutorId: string): Promise<Course[]> {
    return this.coursesRepository.find({
      where: { tutorId },
      relations: ['topics']
    });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: User): Promise<Course> {
    const course = await this.findOne(id);
    
    if (course.tutorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own courses');
    }

    await this.coursesRepository.update(id, updateCourseDto);
    return this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const course = await this.findOne(id);
    
    if (course.tutorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.coursesRepository.delete(id);
  }
}
