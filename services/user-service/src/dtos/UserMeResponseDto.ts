import { IsString, IsEmail, IsOptional } from 'class-validator';

/**
 * 로그인된 사용자 정보 응답 DTO
 */
export class UserMeResponseDto {
  @IsString()
  id: number;

  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  profileImageUrl?: string;
}
