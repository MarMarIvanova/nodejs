const { injectable, decorate } = require('inversify');
const { BookModel } = require('../models/BookModel');

class BooksRepository {
  async createBook(book) {
    const created = await BookModel.create(book);
    return created.toObject();
  }

  async getBook(id) {
    return BookModel.findOne({ id }).lean();
  }

  async getBooks() {
    return BookModel.find().lean();
  }

  async updateBook(id, updatedBook) {
    return BookModel.findOneAndUpdate({ id }, updatedBook, { new: true }).lean();
  }

  async deleteBook(id) {
    return BookModel.findOneAndDelete({ id }).lean();
  }
}

decorate(injectable(), BooksRepository);

module.exports = { BooksRepository };
