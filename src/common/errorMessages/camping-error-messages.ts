export const CAMPING_ERROR_MESSAGES = {
  PRISMA: {
    NOT_FOUND: (id: number) => `Camping with ID ${id} not found`,
    DUPLICATE: 'There is already a camping with this name',
    VALIDATION: 'Invalid data',
    NOT_AUTHORIZED: 'You are not authorized to perform this action',
    NOT_OWNER: 'You are not the owner of this camping',
    DATABASE: 'Database connection error',
  },
  CLOUDINARY: 'Error uploading file/s to Cloudinary',
};
