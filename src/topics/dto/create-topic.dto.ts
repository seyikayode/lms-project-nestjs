import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateTopicDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    description: string;

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
    order: number = 0;
}
