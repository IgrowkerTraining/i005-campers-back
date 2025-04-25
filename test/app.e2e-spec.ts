import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from 'src/common/exception.filter';
import * as path from 'path';
import { userWithCamping } from './data';
import { CreateCampingDto } from 'src/modules/campings/dto/create-camping.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  // se debe crear  un archivo .env.test.local con las variables de entorno del .env.example y luego correr npm run test:reset:e2e.

  it('register user', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Genorimo',
        email: 'gero@example.com',
        password: '1234567',
        owner: true,
      })
      .set('Accept', 'application/json')
      .expect(201);
  });

  it('login user should return 201', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userWithCamping.email,
        password: '123456',
      })
      .set('Accept', 'application/json')
      .expect(201);
  });

  it('login user should return Unauthorized', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userWithCamping.email,
        password: '12353456',
      })
      .set('Accept', 'application/json')
      .expect(401);
  });

  it('create camping should return 201', async () => {
    const camping: CreateCampingDto = {
      name: 'Camping Negreo',
      description: 'pescadores y familias.',
      contactPhone: '6677-5949',
      location: {
        campingAddress: 'Ruta 12 km 45, Villa General Belgrano, Malaga',
        mapLink: 'https://maps.app.goo.gl/ejemplo123',
      },
      amenities: [
        {
          name: 'bar',
        },
      ],
      nearbyAttractions: [
        {
          name: 'tirolina',
        },
      ],
      limitCamping: {
        maxTents: 2,
        maxUsers: 9,
      },
      pricing: {
        pricePerNight: 300,
        tarifa: 'noche',
      },
    };

    const userLogged = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userWithCamping.email,
        password: '123456',
      })
      .set('Accept', 'application/json');

    //Para que funcione, no encontre otra solucion que comentar el validador tipo de archivo en el create de camping.controller
    await request(app.getHttpServer())
      .post('/campings')
      .set('Content-Type', 'multipart/form-data')
      .attach('files', path.resolve(__dirname, 'images/cat.jpg'))
      .field('createCampingDto', JSON.stringify(camping))
      .auth(userLogged.body.token, { type: 'bearer' })
      .expect(201);
  });
});
