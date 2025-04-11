import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
// import streamifier from 'streamifier';

const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((res, rej) => {
      const uploadSteam = cloudinary.uploader.upload_stream((err, result) => {
        if (err) return rej(err);

        res(result);
      });
      streamifier.createReadStream(file.buffer).pipe(uploadSteam);
    });
  }
}
