import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CoursesService } from 'src/courses/courses.service';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    private coursesService: CoursesService
  ) {}
  
  async create(courseId: string, createTopicDto: CreateTopicDto, user: User): Promise<Topic> {
    const course = await this.coursesService.findOne(courseId);
    
    if (course.tutorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only create topics for your own courses');
    }

    const topic = this.topicsRepository.create({
      ...createTopicDto,
      courseId
    });
    
    return this.topicsRepository.save(topic);
  }

  async findByCourse(courseId: string): Promise<Topic[]> {
    return this.topicsRepository.find({
      where: { courseId },
      order: { order: 'ASC', createdAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({
      where: { id },
      relations: ['course']
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto, user: User): Promise<Topic> {
    const topic = await this.findOne(id);
    
    if (topic.course.tutorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update topics from your own courses');
    }

    await this.topicsRepository.update(id, updateTopicDto);
    return this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const topic = await this.findOne(id);
    
    if (topic.course.tutorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete topics from your own courses');
    }

    await this.topicsRepository.delete(id);
  }
}
