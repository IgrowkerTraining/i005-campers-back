import * as dotenv from 'dotenv';

dotenv.config();

// const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
// const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
// const CLOUDINARY_API_KEY_SECRET = process.env.CLOUDINARY_API_KEY_SECRET;
// const CLOUDINARY_API_KEY_NAME = process.env.CLOUDINARY_API_KEY_NAME;
// const MAX_SIZE_IMAGE = process.env.MAX_SIZE_IMAGE;

const dotenvOptions = {
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_KEY_NAME: process.env.CLOUDINARY_API_KEY_NAME,
  CLOUDINARY_API_KEY_SECRET: process.env.CLOUDINARY_API_KEY_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  MAX_SIZE_IMAGE: process.env.MAX_SIZE_IMAGE,
};

export default dotenvOptions;
