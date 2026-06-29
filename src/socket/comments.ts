import { Server } from 'socket.io';

interface CommentInput {
    username?: string;
    text?: string;
}

interface CommentItem {
    id: string;
    username: string;
    text: string;
    createdAt: string;
}

const commentsByBook = new Map<string, CommentItem[]>();

function getComments(bookId: string): CommentItem[] {
    if (!commentsByBook.has(bookId)) {
        commentsByBook.set(bookId, []);
    }
    return commentsByBook.get(bookId) as CommentItem[];
}

function addComment(bookId: string, comment: CommentInput): CommentItem {
    const list = getComments(bookId);
    const item: CommentItem = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2),
        username: comment.username || 'Anonymous',
        text: comment.text || '',
        createdAt: new Date().toISOString(),
    };
    list.push(item);
    return item;
}

export function setupBookComments(io: Server): void {
    io.on('connection', (socket) => {
        const query = socket.handshake.query as Record<string, string | undefined>;
        const roomName = query.roomName || query.bookId;
        if (!roomName) return;

        const bookId = String(roomName);
        socket.join(bookId);

        socket.emit('comments-history', getComments(bookId));

        socket.on('comment', (msg: CommentInput) => {
            const comment = addComment(bookId, msg);
            io.to(bookId).emit('comment', comment);
        });

        socket.on('disconnect', () => {});
    });
}
