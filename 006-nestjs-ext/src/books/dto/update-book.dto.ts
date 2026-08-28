import { CreateBookDto } from './create-book.dto.js';

export class UpdateBookDto implements Partial<CreateBookDto> {
  title?: string;
  description?: string;
  authors?: string;
  favorite?: boolean;
  fileCover?: string;
  fileName?: string;
}
