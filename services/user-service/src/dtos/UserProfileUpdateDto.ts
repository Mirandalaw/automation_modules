import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

/**
 * UserProfileUpdateDto
 * - 사용자 프로필 수정 요청 시 사용하는 DTO
 * - 닉네임, 소개글, 이미지 URL 등 선택적으로 수정 가능
 */
export class UserProfileUpdateDto {
  @IsOptional()
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  nickname?: string;

  @IsOptional()
  @IsString({ message: '소개글은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '소개글은 최대 100자까지 가능합니다.' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: '이미지 URL은 유효한 형식이어야 합니다.' })
  profileImageUrl?: string;
}
