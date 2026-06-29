require('reflect-metadata');
const { Container } = require('inversify');
const { BooksRepository } = require('./repositories/books-repository');

const container = new Container();
container.bind(BooksRepository).toSelf();

module.exports = { container };
