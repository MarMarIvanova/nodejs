import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { Book, BookDocument } from './schemas/book.schema.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {}

  async findAll(): Promise<BookDocument[]> {
    return this.bookModel.find().exec();
  }

  async findOne(id: string): Promise<BookDocument> {
    const book = Types.ObjectId.isValid(id)
      ? await this.bookModel.findById(id).exec()
      : null;

    if (!book) {
      throw new NotFoundException(`The book with id ${id} is not found`);
    }

    return book;
  }

  async create(dto: CreateBookDto): Promise<BookDocument> {
    return this.bookModel.create(dto);
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookDocument> {
    const book = Types.ObjectId.isValid(id)
      ? await this.bookModel
          .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
          .exec()
      : null;

    if (!book) {
      throw new NotFoundException(`The book with id ${id} is not found`);
    }

    return book;
  }

  async remove(id: string): Promise<void> {
    const book = Types.ObjectId.isValid(id)
      ? await this.bookModel.findByIdAndDelete(id).exec()
      : null;

    if (!book) {
      throw new NotFoundException(`The book with id ${id} is not found`);
    }
  }
}
