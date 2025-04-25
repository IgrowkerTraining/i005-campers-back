import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { userWithCamping } from './data';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: userWithCamping,
  });

  // await prisma.camping.create({
  //   data: {
  //     user: {
  //       connect: { id: idUser1 },
  //     },
  //     contactPhone: '+54945346884593',
  //     description: 'Hermoso el camping',
  //     name: 'El Camping',
  //     createdAt: new Date().toISOString(),
  //   },
  // });
}

main()
  .then(() => {
    console.log('db llenada correctamente');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
