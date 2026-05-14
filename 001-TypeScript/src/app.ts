interface Book {
    name: string;
    isbn: string;
}

const book: Book = {
    name: 'Над пропастью во ржи',
    isbn: '123123123'
};

const container = document.getElementById('content');

if (container) {
    container.textContent = `Название книги: ${book.name}, ISBN: ${book.isbn}`;
}