import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema({ collection: 'books', timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  authors: string;

  @Prop({ default: false })
  favorite: boolean;

  @Prop({ default: '' })
  fileCover: string;

  @Prop({ default: '' })
  fileName: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
