import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('enroll/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  enrollInCourse(
    @Param('courseId') courseId: string,
    @Request() req
  ) {
    return this.progressService.enrollInCourse(courseId, req.user);
  }

  @Get('my-courses')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  getMyEnrollments(@Request() req) {
    return this.progressService.getStudentEnrollments(req.user.id);
  }

  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  getCourseProgress(
    @Param('courseId') courseId: string,
    @Request() req
  ) {
    return this.progressService.getCourseProgress(courseId, req.user.id);
  }

  @Post('complete-topic/:topicId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  completeTopicProgress(
    @Param('topicId') topicId: string,
    @Request() req
  ) {
    return this.progressService.markTopicComplete(topicId, req.user);
  }
}
