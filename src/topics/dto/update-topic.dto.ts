import { PartialType } from '@nestjs/mapped-types';
import { CreateTopicDto } from './create-topic.dto';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    duration?: number = 0;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString()
    @IsOptional()
    video?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    order?: number = 0;
}
