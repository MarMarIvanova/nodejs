const { mongoose } = require('../db/mongoose');

const bookSchema = new mongoose.Schema(
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
  { collection: 'books' }
);

const BookModel = mongoose.model('Book', bookSchema);

module.exports = { BookModel, bookSchema };
