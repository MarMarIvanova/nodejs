const express = require('express')
const store = require('../store')
const router = express.Router()
const Book = require('../models/book');
const upload = require('../middleware/upload');
const path = require('path');


router.get('/books', (req, res) => {
    const {books} = store;
    res.render('index', { books });
});

router.get('/books/create', (req, res) => {
    res.render('create');
});

router.get('/books/:id/update', (req, res) => {
    const {books} = store;
    const {id} = req.params;
    const book = books.find(el => el.id === id);
    
    if (!book) {
        return res.status(404).send('Book not found');
    }
    
    res.render('update', { book });
});

router.get('/books/:id', (req, res) => {
    const {books} = store;
    const {id} = req.params;
    const book = books.find(el => el.id === id);
    
    if (!book) {
        return res.status(404).send('Book not found');
    }
    
    res.render('view', { book });
});

router.post('/books/create', upload.single('fileBook'), (req, res) => {
    const {books} = store;
    const {title, description, authors, favorite, fileCover, fileName} = req.body;
    
    const fileBook = req.file ? req.file.path : '';

    const newBook = new Book(
        title, 
        description, 
        authors, 
        favorite === 'true' || favorite === true,
        fileCover,
        fileName,
        fileBook
    );
    
    books.push(newBook);
    res.redirect(`/books/${newBook.id}`);
});

router.post('/books/:id/update', upload.single('fileBook'), (req, res) => {
    const {books} = store;
    const {id} = req.params;
    const {title, description, authors, favorite, fileCover, fileName} = req.body;
    const idx = books.findIndex(el => el.id === id);

    if (idx === -1) {
        return res.status(404).send('Book not found');
    }

    const updatedBook = {
        ...books[idx],
        title,
        description,
        authors,
        favorite: favorite === 'true' || favorite === true,
        fileCover,
        fileName
    };

    if (req.file) {
        updatedBook.fileBook = req.file.path;
    }

    books[idx] = updatedBook;
    res.redirect(`/books/${id}`);
});

router.post('/books/:id/delete', (req, res) => {
    const {books} = store;
    const {id} = req.params;
    const idx = books.findIndex(el => el.id === id);
     
    if (idx !== -1) {
        books.splice(idx, 1);
        res.redirect('/books');
    } else {
        res.status(404).send('Book not found');
    }
});

router.get('/', (req, res) => {
    res.redirect('/books');
})

router.get('/api/user/login', (req, res) => {
    const {user} = store
    res.status(201)
    res.json(user)
})

router.get('/api/books', (req, res) => {
    const {books} = store
    res.json(books)
})

router.get('/api/books/:id', (req, res) => {
    const {books} = store
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)

    if( idx !== -1) {
        res.json(books[idx])
    } else {
        res.status(404)
        res.json('404 | page not found')
    }
})

router.post('/api/books/', upload.single('fileBook'), (req, res) => {
    const {books} = store;
    const {title, description, authors, favorite, fileCover, fileName} = req.body;
    
    const fileBook = req.file ? req.file.path : '';

    const newBook = new Book(
        title, 
        description, 
        authors, 
        favorite === 'true' || favorite === true,
        fileCover,
        fileName,
        fileBook
    );
    
    books.push(newBook);

    res.status(201);
    res.json(newBook);
});

router.put('/api/books/:id', (req, res) => {
    const {books} = store
    const {title, description, authors, favorite, fileCover, fileName} = req.body
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)

    if (idx !== -1){
        books[idx] = {
            ...books[idx],
            title,
            description,
            authors,
            favorite,
            fileCover,
            fileName
        }

        res.json(books[idx])
    } else {
        res.status(404)
        res.json('404 | page not found')
    }
})

router.delete('/api/books/:id', (req, res) => {
    const {books} = store
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)
     
    if(idx !== -1){
        books.splice(idx, 1)
        res.json(true)
    } else {
        res.status(404)
        res.json('404 | page not found')
    }
})

router.get('/api/books/:id/download', (req, res) => {
    const {books} = store;
    const {id} = req.params;
    const book = books.find(el => el.id === id);

    if (!book) {
        res.status(404);
        return res.json({ error: '404 | Book does not exist' });
    }

    if (!book.fileBook) {
        res.status(404);
        return res.json({ error: 'Book file does not exist' });
    }

    const fs = require('fs');
    if (!fs.existsSync(book.fileBook)) {
        res.status(404);
        return res.json({ error: 'Book file does not exist' });
    }

    const fileName = book.fileName || path.basename(book.fileBook);
    res.download(book.fileBook, fileName, (err) => {
        if (err) {
            console.error('Downloading error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Downloading error' });
            }
        }
    });
});

module.exports = router