import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditTodoDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status?: string;
}
