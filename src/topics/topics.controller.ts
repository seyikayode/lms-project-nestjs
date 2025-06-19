import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('courses/:courseId/topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR)
  create(
    @Param('courseId') courseId: string,
    @Body() createTopicDto: CreateTopicDto,
    @Request() req
  ) {
    return this.topicsService.create(courseId, createTopicDto, req.user);
  }

  @Get()
  findByCourse(@Param('courseId') courseId: string) {
    return this.topicsService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @Request() req
  ) {
    return this.topicsService.update(id, updateTopicDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  remove(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.topicsService.remove(id, req.user);
  }
}
