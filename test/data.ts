import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const idUser1 = crypto.randomUUID();

export const userWithCamping: User = {
  email: 'userWithCamping@gmail.com',
  password: bcrypt.hashSync('123456', 10),
  id: idUser1,
  owner: true,
  name: 'Test User 1',
};
