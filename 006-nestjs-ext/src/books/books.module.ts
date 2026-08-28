import { Module } from '@nestjs/common';
import { BooksService } from './books.service.js';
import { BooksController } from './books.controller.js';

@Module({
  providers: [BooksService],
  controllers: [BooksController]
})
export class BooksModule {}
