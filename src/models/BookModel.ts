import { Document, Schema, model } from 'mongoose';

export interface IBook extends Document {
    id: string;
    title: string;
    description: string;
    authors: string;
    favorite: string;
    fileCover: string;
    fileName: string;
    fileBook: string;
}

export const bookSchema = new Schema<IBook>(
    {
        id: { type: String, required: true },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        authors: { type: String, default: '' },
        favorite: { type: String, default: '' },
        fileCover: { type: String, default: '' },
        fileName: { type: String, default: '' },
        fileBook: { type: String, default: '' },
    },
    { collection: 'books' },
);

export const BookModel = model<IBook>('Book', bookSchema);
