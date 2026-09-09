import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BookCommentsModule } from './book-comments/book-comments.module.js';
import { BooksModule } from './books/books.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: '006-nestjs-ext',
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
        'mongodb://root:example@localhost:27017/library?authSource=admin',
    ),
    BooksModule,
    BookCommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
