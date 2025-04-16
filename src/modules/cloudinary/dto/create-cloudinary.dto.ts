import { ArrayNotEmpty } from 'class-validator';

export class CreateCloudinaryDto {
  @ArrayNotEmpty()
  files: Express.Multer.File[];
}
