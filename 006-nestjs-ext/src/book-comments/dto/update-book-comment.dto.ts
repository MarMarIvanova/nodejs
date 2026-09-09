import { CreateBookCommentDto } from './create-book-comment.dto.js';

export class UpdateBookCommentDto implements Partial<CreateBookCommentDto> {
  bookId?: number;
  comment?: string;
}
