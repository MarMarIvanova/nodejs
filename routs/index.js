const express = require('express');
const passport = require('../db/passport');
const { v4: uuid } = require('uuid');
const store = require('../store');
const router = express.Router();
const Book = require('../models/book');
const { BookModel } = require('../models/BookModel');
const upload = require('../middleware/upload');
const path = require('path');

router.get('/api/user/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/books');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.render('login', { message: req.query.message });
});

router.get('/api/user/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login?message=Authorization required');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.render('profile', { user: req.user });
});

router.post('/api/user/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.redirect('/login?message=' + encodeURIComponent(info?.message || 'Login error'));
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.redirect('/api/user/me');
    });
  })(req, res, next);
});

router.post('/api/user/signup', (req, res, next) => {
  const { username, password, displayName, email } = req.body;
  if (!username || !password) {
    return res.redirect('/signup?message=' + encodeURIComponent('Please enter login and password'));
  }
  const { createUser } = require('../db/users');
  createUser(username, password, displayName, email, (err, user) => {
    if (err) {
      return res.redirect('/signup?message=' + encodeURIComponent(err.message || 'Registration error'));
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.redirect('/api/user/me');
    });
  });
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/books');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.render('login', { message: req.query.message });
});

router.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/books');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.render('signup', { message: req.query.message });
});

router.get('/profile', (req, res) => res.redirect('/api/user/me'));
router.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/books');
  } else {
    res.redirect('/');
  }
});
router.get('/home', (req, res) => res.render('home', { user: req.user || null }));

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

router.get('/books/:id', async (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const book = books.find(el => el.id === id);

    if (!book) {
        return res.status(404).send('Book not found');
    }

    let viewCount = 0;
    const counterUrl = process.env.COUNTER_URL || 'http://localhost:3002';
    try {
        await fetch(`${counterUrl}/counter/${id}/incr`, { method: 'POST' });
        const counterRes = await fetch(`${counterUrl}/counter/${id}`);
        const data = await counterRes.json();
        viewCount = data.count ?? 0;
    } catch (err) {
        console.error('Counter service error:', err.message);
    }

    res.render('view', { book, viewCount, user: req.user || null });
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
  if (req.isAuthenticated()) {
    return res.redirect('/books');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.render('home', { user: req.user || null });
});

router.get('/api/books', async (req, res) => {
    try {
        const books = await BookModel.find().lean();
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await BookModel.findOne({ id }).lean();
        if (!book) {
            return res.status(404).json('404 | page not found');
        }
        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.post('/api/books/', upload.single('fileBook'), async (req, res) => {
    try {
        const { title, description, authors, favorite, fileCover, fileName } = req.body;
        const fileBook = req.file ? req.file.path : '';
        const id = uuid();

        const newBook = await BookModel.create({
            id,
            title: title || '',
            description: description || '',
            authors: authors || '',
            favorite: favorite === 'true' || favorite === true ? 'true' : 'false',
            fileCover: fileCover || '',
            fileName: fileName || '',
            fileBook,
        });

        res.status(201);
        res.json(newBook.toObject());
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, authors, favorite, fileCover, fileName } = req.body;

        const book = await BookModel.findOneAndUpdate(
            { id },
            { title, description, authors, favorite, fileCover, fileName },
            { new: true }
        ).lean();

        if (!book) {
            return res.status(404).json('404 | page not found');
        }
        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BookModel.findOneAndDelete({ id });
        if (!result) {
            return res.status(404).json('404 | page not found');
        }
        res.json('ok');
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.get('/api/books/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await BookModel.findOne({ id }).lean();
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
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

module.exports = router