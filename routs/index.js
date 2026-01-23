const express = require('express')
const store = require('../store')
const router = express.Router()
const Book = require('../classes/book');
const upload = require('../middleware/upload');

router.get('/', (req, res) => {
    const {url} = req
    res.json({url})
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

// OLD VERSION
//  router.post('/api/books/', (req, res) => {
//     const {books} = store
//     const {title, description, authors, favorite, fileCover, fileName} = req.body

//     const newBook = new Book(title, description, authors, favorite, fileCover, fileName)
//     books.push(newBook)

//     res.status(201)
//     res.json(books)
// })

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
    const {title, desc} = req.body
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