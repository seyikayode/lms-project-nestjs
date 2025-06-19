import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { TopicCompletion } from './entities/topic-completion.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { TopicsModule } from 'src/topics/topics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEnrollment, TopicCompletion]),
    CoursesModule,
    TopicsModule
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService]
})
export class ProgressModule {}
