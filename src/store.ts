const Book = require('./models/book')
const User = require('./models/user')

module.exports = {
    books: [
        new Book('Test title', 'Test description', 'Test authors', false, 'Test fileCover', 'Test fileName', 'Test fileBook'),
        new Book('Test title 2', 'Test description 2', 'Test authors 2', false, 'Test fileCover 2', 'Test fileName 2', 'Test fileBook 2'),
    ],
    user: new User('test@mail.ru'),
}
