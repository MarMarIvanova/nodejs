import { injectable } from 'inversify';
import { BookModel, IBook } from '../models/BookModel';

export interface BookInput {
    id: string;
    title?: string;
    description?: string;
    authors?: string;
    favorite?: string;
    fileCover?: string;
    fileName?: string;
    fileBook?: string;
}

export type BookUpdate = Partial<Omit<BookInput, 'id'>>;

@injectable()
export class BooksRepository {
    async createBook(book: BookInput): Promise<IBook> {
        const created = await BookModel.create(book);
        return created.toObject();
    }

    async getBook(id: string): Promise<IBook | null> {
        return BookModel.findOne({ id }).lean<IBook>();
    }

    async getBooks(): Promise<IBook[]> {
        return BookModel.find().lean<IBook[]>();
    }

    async updateBook(id: string, updatedBook: BookUpdate): Promise<IBook | null> {
        return BookModel.findOneAndUpdate({ id }, updatedBook, { new: true }).lean<IBook>();
    }

    async deleteBook(id: string): Promise<IBook | null> {
        return BookModel.findOneAndDelete({ id }).lean<IBook>();
    }
}
