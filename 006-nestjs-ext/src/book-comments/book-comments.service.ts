import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookCommentDto } from './dto/create-book-comment.dto.js';
import { UpdateBookCommentDto } from './dto/update-book-comment.dto.js';
import {
  BookCommentDocument,
  BookCommentModel,
} from './schemas/book-comment.schema.js';

@Injectable()
export class BookCommentsService {
  constructor(
    @InjectModel(BookCommentModel.name)
    private readonly bookCommentModel: Model<BookCommentDocument>,
  ) {}

  async findAll(): Promise<BookCommentDocument[]> {
    return this.bookCommentModel.find().exec();
  }

  async findAllBookComment(bookId: number): Promise<BookCommentDocument[]> {
    return this.bookCommentModel.find({ bookId }).exec();
  }

  async findOne(id: number): Promise<BookCommentDocument> {
    const comment = await this.bookCommentModel.findOne({ id }).exec();

    if (!comment) {
      throw new NotFoundException(`The comment with id ${id} is not found`);
    }

    return comment;
  }

  async create(dto: CreateBookCommentDto): Promise<BookCommentDocument> {
    return this.bookCommentModel.create({ ...dto, id: await this.nextId() });
  }

  async update(
    id: number,
    dto: UpdateBookCommentDto,
  ): Promise<BookCommentDocument> {
    const comment = await this.bookCommentModel
      .findOneAndUpdate({ id }, dto, { new: true, runValidators: true })
      .exec();

    if (!comment) {
      throw new NotFoundException(`The comment with id ${id} is not found`);
    }

    return comment;
  }

  async remove(id: number): Promise<void> {
    const comment = await this.bookCommentModel.findOneAndDelete({ id }).exec();

    if (!comment) {
      throw new NotFoundException(`The comment with id ${id} is not found`);
    }
  }

  private async nextId(): Promise<number> {
    const last = await this.bookCommentModel
      .findOne()
      .sort({ id: -1 })
      .select('id')
      .exec();

    return (last?.id ?? 0) + 1;
  }
}
