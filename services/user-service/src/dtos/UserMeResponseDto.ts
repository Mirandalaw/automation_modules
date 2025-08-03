import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

/**
 * 로그인된 사용자 정보 응답 DTO
 */
export class UserMeResponseDto {
  @IsUUID()
  id: string; // number → string(uuid)

  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  profileImageUrl?: string;
}
