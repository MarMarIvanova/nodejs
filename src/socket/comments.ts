const commentsByBook = new Map();

function getComments(bookId) {
  if (!commentsByBook.has(bookId)) {
    commentsByBook.set(bookId, []);
  }
  return commentsByBook.get(bookId);
}

function addComment(bookId, comment) {
  const list = getComments(bookId);
  const item = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2),
    username: comment.username || 'Anonymous',
    text: comment.text || '',
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  return item;
}

function setupBookComments(io) {
  io.on('connection', (socket) => {
    const roomName = socket.handshake.query?.roomName || socket.handshake.query?.bookId;
    if (!roomName) return;

    const bookId = String(roomName);
    socket.join(bookId);

    socket.emit('comments-history', getComments(bookId));

    socket.on('comment', (msg) => {
      const comment = addComment(bookId, msg);
      io.to(bookId).emit('comment', comment);
    });

    socket.on('disconnect', () => {});
  });
}

module.exports = { setupBookComments };
