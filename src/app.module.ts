import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { TopicsModule } from './topics/topics.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgressModule } from './progress/progress.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432'),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development'
    }),
    CoursesModule,
    TopicsModule,
    AuthModule,
    UsersModule,
    ProgressModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
