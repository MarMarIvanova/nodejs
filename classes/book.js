const { v4: uuid } = require('uuid');

class Book {
    constructor(
        title = '', 
        description = '', 
        authors = '', 
        favorite = false, 
        fileCover = '', 
        fileName = '',
        fileBook = ''
    ) {
        this.id = uuid(),
        this.title = title;
        this.description = description;
        this.authors = authors;
        this.favorite = favorite;
        this.fileCover = fileCover;
        this.fileName = fileName;
        this.fileBook = fileBook;
    }
}

module.exports = Book;