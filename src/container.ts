import 'reflect-metadata';
import { Container } from 'inversify';
import { BooksRepository } from './repositories/books-repository';

export const container = new Container();
container.bind(BooksRepository).toSelf();
