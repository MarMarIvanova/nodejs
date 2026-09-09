import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookCommentsGateway } from './book-comments.gateway.js';
import { BookCommentsService } from './book-comments.service.js';
import {
  BookCommentModel,
  BookCommentSchema,
} from './schemas/book-comment.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookCommentModel.name, schema: BookCommentSchema },
    ]),
  ],
  providers: [BookCommentsService, BookCommentsGateway],
  exports: [BookCommentsService],
})
export class BookCommentsModule {}
