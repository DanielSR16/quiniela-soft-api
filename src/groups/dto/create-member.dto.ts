import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export type GroupMemberRole = 'group_admin' | 'member';

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsIn(['group_admin', 'member'])
  role: GroupMemberRole;
}
