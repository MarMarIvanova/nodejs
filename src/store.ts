import { Book } from './models/book';
import { User } from './models/user';

export const store = {
    books: [
        new Book('Test title', 'Test description', 'Test authors', false, 'Test fileCover', 'Test fileName', 'Test fileBook'),
        new Book('Test title 2', 'Test description 2', 'Test authors 2', false, 'Test fileCover 2', 'Test fileName 2', 'Test fileBook 2'),
    ],
    user: new User('test@mail.ru'),
};

export default store;
