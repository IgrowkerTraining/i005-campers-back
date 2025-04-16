import { v2 as cloudinary } from 'cloudinary';
import dotenvOptions from './dotenv.config';

cloudinary.config({
  cloud_name: dotenvOptions.CLOUDINARY_API_KEY_NAME,
  api_key: dotenvOptions.CLOUDINARY_API_KEY,
  api_secret: dotenvOptions.CLOUDINARY_API_KEY_SECRET,
});

export default cloudinary;
