import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { Book } from './entities/book.entity.js';

@Injectable()
export class BooksService {
  private books: Book[] = [
    {
      id: '1',
      title: 'BookTitle',
      description: 'Test description',
      authors: 'Mar Ivanova',
      favorite: false,
      fileCover: '',
      fileName: '',
    },
    {
      id: '2',
      title: 'BookTitle 2',
      description: 'Test description Test description',
      authors: 'Mar Ivanova',
      favorite: true,
      fileCover: '',
      fileName: '',
    },
  ];

  findAll(): Book[] {
    return this.books;
  }

  findOne(id: string): Book {
    const book = this.books.find((item) => item.id === id);

    if (!book) {
      throw new NotFoundException(`Книга с id ${id} не найдена`);
    }

    return book;
  }

  create(dto: CreateBookDto): Book {
    const book: Book = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description,
      authors: dto.authors,
      favorite: dto.favorite ?? false,
      fileCover: dto.fileCover ?? '',
      fileName: dto.fileName ?? '',
    };

    this.books.push(book);

    return book;
  }

  update(id: string, dto: UpdateBookDto): Book {
    const book = this.findOne(id);

    Object.assign(book, dto);

    return book;
  }

  remove(id: string): void {
    const index = this.books.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Книга с id ${id} не найдена`);
    }

    this.books.splice(index, 1);
  }
}
