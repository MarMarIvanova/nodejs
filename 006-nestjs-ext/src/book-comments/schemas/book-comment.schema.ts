import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookCommentDocument = HydratedDocument<BookCommentModel>;

@Schema({ collection: 'bookComments', timestamps: true })
export class BookCommentModel {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, index: true })
  bookId: number;

  @Prop({ required: true })
  comment: string;
}

export const BookCommentSchema = SchemaFactory.createForClass(BookCommentModel);
