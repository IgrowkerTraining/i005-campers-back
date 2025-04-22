import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';

const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFiles(files: Express.Multer.File): Promise<CloudinaryResponse> {
    try {
      return new Promise<CloudinaryResponse>((res, rej) => {
        const uploadSteam = cloudinary.uploader.upload_stream((err, result) => {
          if (err) {
            console.error('Error uploading Cloudinary', err.stack);
            return rej(err);
          }
          res(result);
        });
        streamifier.createReadStream(files.buffer).pipe(uploadSteam);
      });
    } catch (error) {
      console.error('Error in CloudinaryService', error.stack);
      throw error;
    }
  }
}
