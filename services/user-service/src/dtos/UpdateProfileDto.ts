import { IsOptional, IsString, Length, IsUrl } from 'class-validator';

/**
 * UpdateProfileDto
 * - 사용자 프로필 수정 요청 DTO
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 20, { message: '닉네임은 2~20자여야 합니다.' })
  nickname?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: '자기소개는 최대 100자까지 작성 가능합니다.' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: '이미지는 유효한 URL이어야 합니다.' })
  profileImageUrl?: string;
}
