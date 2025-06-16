import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "src/common/enums/user-role.enum";

export class RegisterDto {
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(8)
    password: string;
  
    @IsString()
    firstName: string;
  
    @IsString()
    lastName: string;
  
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.STUDENT;
  
    @IsString()
    @IsOptional()
    profileImage?: string;
}