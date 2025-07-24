import { IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class PointChangeDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
