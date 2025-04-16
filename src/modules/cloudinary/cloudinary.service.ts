// import { Injectable } from '@nestjs/common';
// import { CloudinaryResponse } from './cloudinary-response';
// import { v2 as cloudinary } from 'cloudinary';
// // import streamifier from 'streamifier';

// const streamifier = require('streamifier');

// @Injectable()
// export class CloudinaryService {
//   uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
//     return new Promise<CloudinaryResponse>((res, rej) => {
//       const uploadSteam = cloudinary.uploader.upload_stream((err, result) => {
//         if (err) return rej(err);

//         res(result);
//       });
//       streamifier.createReadStream(file.buffer).pipe(uploadSteam);
//     });
//   }
// }

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import cloudinary from 'src/config/cloudinary.config';
import dotenvOptions from 'src/config/dotenv.config';
import { ImgExtension } from 'src/enums/enum';

@Injectable()
export class CloudinaryService {
  private readonly MAX_SIZE = parseInt(dotenvOptions.MAX_SIZE_IMAGE); // Tamaño máximo en KB
  // private readonly DEFAULT_IMG = dotenvOptions.DEFAULT_IMG_EVENT_CLOUDINARY; // Imagen por defecto

  private checkSizeImages(files: Express.Multer.File[]): boolean {
    return files.every((file) => file.size / 1024 <= this.MAX_SIZE); // Correctly checks size in KB
  }
  private checkFormatImages(files: Express.Multer.File[]): boolean {
    const validExtensions = Object.values(ImgExtension);
    return files.every((file) => {
      const extension = file.originalname.split('.').pop() as ImgExtension;
      return validExtensions.includes(extension);
    });
  }

  private checkValidImages(files: Express.Multer.File[]): void {
    if (!this.checkSizeImages(files)) {
      throw new HttpException(
        {
          status: 'error',
          message: `Image size cannot exceed ${this.MAX_SIZE}kb`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.checkFormatImages(files)) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Image format must be one of: .jpg | .png | .jpeg | .webp',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
  //   return new Promise((resolve, reject) => {
  //     const upload = this.cloudinary.uploader.upload_stream((error, result) => {
  //       if (error) return reject(error);
  //       resolve(result);
  //     });
  //     upload.end(file.buffer);
  //   });
  // }

  async uploadImagesToCloudinary(images: Express.Multer.File[]): Promise<string[]> {
    this.checkValidImages(images);
    const urls: string[] = [];
    for (const image of images) {
      const { secure_url } = await cloudinary.uploader.upload(image.path);
      urls.push(secure_url);
    }
    return urls;
  }
}
