import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { Book } from './schemas/book.schema.js';

// The service always finishes a mongoose chain with `.exec()`, so every
// model method has to hand back something that looks like a Query.
const query = <T>(value: T) => ({ exec: vi.fn().mockResolvedValue(value) });

const bookModel = {
  find: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
};

describe('BooksService', () => {
  let service: BooksService;

  const id = new Types.ObjectId().toHexString();
  const malformedId = 'not-an-object-id';

  const book = {
    _id: id,
    title: 'Dune',
    description: 'Arrakis',
    authors: 'Frank Herbert',
    favorite: false,
    fileCover: '',
    fileName: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book.name), useValue: bookModel },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns every book from the model', async () => {
      bookModel.find.mockReturnValue(query([book]));

      await expect(service.findAll()).resolves.toEqual([book]);
      expect(bookModel.find).toHaveBeenCalledTimes(1);
    });

    it('returns an empty list when the collection is empty', async () => {
      bookModel.find.mockReturnValue(query([]));

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the book found by id', async () => {
      bookModel.findById.mockReturnValue(query(book));

      await expect(service.findOne(id)).resolves.toEqual(book);
      expect(bookModel.findById).toHaveBeenCalledWith(id);
    });

    it('throws NotFoundException when the model returns nothing', async () => {
      bookModel.findById.mockReturnValue(query(null));

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `The book with id ${id} is not found`,
      );
    });

    it('throws NotFoundException without querying on a malformed id', async () => {
      await expect(service.findOne(malformedId)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('delegates to the model and returns the created book', async () => {
      const dto: CreateBookDto = {
        title: 'Dune',
        description: 'Arrakis',
        authors: 'Frank Herbert',
      };
      bookModel.create.mockResolvedValue(book);

      await expect(service.create(dto)).resolves.toEqual(book);
      expect(bookModel.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    const dto: UpdateBookDto = { title: 'Dune Messiah' };

    it('returns the updated document and asks for validators', async () => {
      const updated = { ...book, ...dto };
      bookModel.findByIdAndUpdate.mockReturnValue(query(updated));

      await expect(service.update(id, dto)).resolves.toEqual(updated);
      expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(id, dto, {
        new: true,
        runValidators: true,
      });
    });

    it('throws NotFoundException when there is nothing to update', async () => {
      bookModel.findByIdAndUpdate.mockReturnValue(query(null));

      await expect(service.update(id, dto)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException without querying on a malformed id', async () => {
      await expect(service.update(malformedId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the book by id', async () => {
      bookModel.findByIdAndDelete.mockReturnValue(query(book));

      await expect(service.remove(id)).resolves.toBeUndefined();
      expect(bookModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('throws NotFoundException when there is nothing to delete', async () => {
      bookModel.findByIdAndDelete.mockReturnValue(query(null));

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException without querying on a malformed id', async () => {
      await expect(service.remove(malformedId)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookModel.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
