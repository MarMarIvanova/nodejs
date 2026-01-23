const Book = require('./classes/book')
const User = require('./classes/user')

module.exports = {
    books: [
        new Book(),
    ],
    user: new User(),
}
