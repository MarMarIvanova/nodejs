import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { BooksController } from '../src/books/books.controller.js';
import { BooksService } from '../src/books/books.service.js';

// The controller is the subject here, so the service is a plain set of stubs —
// no mongoose, no database.
const booksService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('BooksController (e2e)', () => {
  let app: INestApplication<App>;

  const id = '65d0f1b2c3d4e5f6a7b8c9d0';
  const book = {
    _id: id,
    title: 'Dune',
    description: 'Arrakis',
    authors: 'Frank Herbert',
    favorite: false,
    fileCover: '',
    fileName: '',
  };
  const notFound = new NotFoundException(
    `The book with id ${id} is not found`,
  );

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: booksService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    vi.resetAllMocks();
    await app.close();
  });

  describe('GET /books', () => {
    it('returns 200 and the list of books', async () => {
      booksService.findAll.mockResolvedValue([book]);

      await request(app.getHttpServer())
        .get('/books')
        .expect(200)
        .expect([book]);

      expect(booksService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /books/:id', () => {
    it('returns 200 and the requested book', async () => {
      booksService.findOne.mockResolvedValue(book);

      await request(app.getHttpServer())
        .get(`/books/${id}`)
        .expect(200)
        .expect(book);

      expect(booksService.findOne).toHaveBeenCalledWith(id);
    });

    it('returns 404 when the service reports the book is missing', async () => {
      booksService.findOne.mockRejectedValue(notFound);

      const response = await request(app.getHttpServer())
        .get(`/books/${id}`)
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: `The book with id ${id} is not found`,
      });
    });
  });

  describe('POST /books', () => {
    it('returns 201 and passes the body to the service', async () => {
      const dto = {
        title: 'Dune',
        description: 'Arrakis',
        authors: 'Frank Herbert',
      };
      booksService.create.mockResolvedValue(book);

      await request(app.getHttpServer())
        .post('/books')
        .send(dto)
        .expect(201)
        .expect(book);

      expect(booksService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('PUT /books/:id', () => {
    it('returns 200 and the updated book', async () => {
      const dto = { title: 'Dune Messiah' };
      const updated = { ...book, ...dto };
      booksService.update.mockResolvedValue(updated);

      await request(app.getHttpServer())
        .put(`/books/${id}`)
        .send(dto)
        .expect(200)
        .expect(updated);

      expect(booksService.update).toHaveBeenCalledWith(id, dto);
    });

    it('returns 404 when there is nothing to update', async () => {
      booksService.update.mockRejectedValue(notFound);

      await request(app.getHttpServer())
        .put(`/books/${id}`)
        .send({ title: 'Dune Messiah' })
        .expect(404);
    });
  });

  describe('DELETE /books/:id', () => {
    it('returns 204 with an empty body', async () => {
      booksService.remove.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete(`/books/${id}`)
        .expect(204);

      expect(response.body).toEqual({});
      expect(booksService.remove).toHaveBeenCalledWith(id);
    });

    it('returns 404 when there is nothing to delete', async () => {
      booksService.remove.mockRejectedValue(notFound);

      await request(app.getHttpServer()).delete(`/books/${id}`).expect(404);
    });
  });
});
