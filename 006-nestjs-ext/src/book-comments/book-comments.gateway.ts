import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { BookCommentsService } from './book-comments.service.js';
import { CreateBookCommentDto } from './dto/create-book-comment.dto.js';

const room = (bookId: number) => `book:${bookId}`;

@WebSocketGateway({ cors: { origin: '*' } })
export class BookCommentsGateway {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly bookCommentsService: BookCommentsService) {}

  @SubscribeMessage('getAllComments')
  async getAllComments(
    @MessageBody() bookId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const id = Number(bookId);

    await client.join(room(id));

    return this.bookCommentsService.findAllBookComment(id);
  }

  @SubscribeMessage('addComment')
  async addComment(@MessageBody() dto: CreateBookCommentDto) {
    const created = await this.bookCommentsService.create({
      bookId: Number(dto.bookId),
      comment: dto.comment,
    });

    this.server.to(room(created.bookId)).emit('comment', created);

    return created;
  }
}
