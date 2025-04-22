import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsSanitizedHtml } from 'src/decorators/is-sanitizated-html.decorator';
export class UserCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsSanitizedHtml()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsBoolean()
  owner: boolean;
}
