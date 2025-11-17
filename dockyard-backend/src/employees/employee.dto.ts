import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Christian Chiavelli' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Senior Full Stack Engineer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'a197d5ac-2252-4064-b19b-0d5850517dc3',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  reports_to_id?: string | null;

  @ApiPropertyOptional({ example: 'img/profile.png' })
  @IsOptional()
  @IsString()
  profile_image_url?: string;

  @ApiProperty({ example: 'America/Sao_Paulo' })
  @IsString()
  @IsNotEmpty()
  timezone: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'Brian Harris' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Senior Editorial assistant' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'e0ec3cd3-1a74-48b1-8549-f76cd34ebf2d',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  reports_to_id?: string | null;

  @ApiPropertyOptional({ example: 'img/new-profile.png' })
  @IsOptional()
  @IsString()
  profile_image_url?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateHierarchyDto {
  @ApiPropertyOptional({
    example: 'e0ec3cd3-1a74-48b1-8549-f76cd34ebf2d',
    nullable: true,
    description: 'UUID do novo gerente ou null para tornar funcionário raiz',
  })
  @IsOptional()
  @IsUUID()
  new_manager_id?: string | null;
}
