import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactom from 'pactum';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';

import { EditUserDto } from '../src/user/dto';
import { CreateTodoDto, EditTodoDto } from 'src/todo/dto';

describe('App e2e', () => {
  let app;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    app.listen(3001);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();

    pactom.request.setBaseUrl('http://localhost:3001');
  });

  it.todo('All the test should pass');

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: 'Test-case',
    };

    describe('Sign Up', () => {
      it('Should throw an error when password is empty', () => {
        return pactom
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw an error when email is empty', () => {
        return pactom
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw error when both email and password is empty', () => {
        return pactom
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('Should Sign up when all tghe required parameters are sent in the request', () => {
        return pactom
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign In', () => {
      it('Should throw an error when password is empty', () => {
        return pactom
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw error when email is empty', () => {
        return pactom
          .spec()
          .post('/auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw error when both email and password is empty', () => {
        return pactom.spec().post('/auth/login').withBody({}).expectStatus(400);
      });

      it('Should throw an error when password is wrong', () => {
        return pactom
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
            password: 'Gg',
          })
          .expectStatus(403);
      });

      it('Should Sign In when usee login with valid credentials', () => {
        return pactom
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('User Info', () => {
      it('It should get the current user information', () => {
        return pactom
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      const editDto: EditUserDto = {
        firstName: 'first',
        lastName: 'last',
      };

      it('It should edit User Information', () => {
        return pactom
          .spec()
          .patch('/users/edit')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(editDto)
          .expectStatus(200)
          .expectBodyContains('firstName')
          .expectBodyContains('lastName');
      });
    });
  });

  describe('TODO', () => {
    it('Should get empty todos', () => {
      return pactom
        .spec()
        .get('/todos/')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200)
        .expectBody([]);
    });

    it('Should create a todo', () => {
      const dto: CreateTodoDto = {
        title: 'This is a test todo',
        description: 'This is a test Todo',
      };

      return pactom
        .spec()
        .post('/todos/')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .withBody(dto)
        .expectStatus(201)
        .stores('todoId', 'id');
    });

    it('Should get one todos', () => {
      return pactom
        .spec()
        .get('/todos/')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200)
        .expectJsonLength(1)
        .inspect();
    });

    it('List Todo By Id', () => {
      return pactom
        .spec()
        .get('/todos/{id}')
        .withPathParams('id', '$S{todoId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200);
    });

    it('Edit todo by If', () => {
      const dto: EditTodoDto = {
        status: 'completed',
      };

      return pactom
        .spec()
        .patch('/todos/{id}')
        .withPathParams('id', '$S{todoId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .withBody(dto)
        .expectStatus(200);
    });

    it('Delete Todo By Id', () => {
      return pactom
        .spec()
        .delete('/todos/{id}')
        .withPathParams('id', '$S{todoId}')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .expectStatus(200);
    });
  });

  afterAll(() => {
    app.close();
  });
});
