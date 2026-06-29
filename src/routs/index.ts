import express, { Request, Response, NextFunction } from 'express';
import passport from '../db/passport';
import { v4 as uuid } from 'uuid';
import store from '../store';
import { Book } from '../models/book';
import { BookModel } from '../models/BookModel';
import upload from '../middleware/upload';
import path from 'path';
import fs from 'fs';
import { container } from '../container';
import { BooksRepository } from '../repositories/books-repository';
import { createUser, UserRecord } from '../db/users';

const router = express.Router();

router.get('/api/user/login', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect('/books');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('login', { message: req.query.message });
});

router.get('/api/user/me', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login?message=Authorization required');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('profile', { user: req.user });
});

router.post('/api/user/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error | null, user: UserRecord | false, info: { message?: string } | undefined) => {
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

router.post('/api/user/signup', (req: Request, res: Response, next: NextFunction) => {
    const { username, password, displayName, email } = req.body;
    if (!username || !password) {
        return res.redirect('/signup?message=' + encodeURIComponent('Please enter login and password'));
    }
    createUser(username, password, displayName, email, (err, user) => {
        if (err || !user) {
            return res.redirect('/signup?message=' + encodeURIComponent(err?.message || 'Registration error'));
        }
        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.redirect('/api/user/me');
        });
    });
});

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

router.get('/login', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect('/books');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('login', { message: req.query.message });
});

router.get('/signup', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect('/books');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('signup', { message: req.query.message });
});

router.get('/profile', (req: Request, res: Response) => res.redirect('/api/user/me'));
router.get('/api/user', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.redirect('/books');
    } else {
        res.redirect('/');
    }
});
router.get('/home', (req: Request, res: Response) => res.render('home', { user: req.user || null }));

router.get('/books', (req: Request, res: Response) => {
    const { books } = store;
    res.render('index', { books });
});

router.get('/books/create', (req: Request, res: Response) => {
    res.render('create');
});

router.get('/books/:id/update', (req: Request, res: Response) => {
    const { books } = store;
    const { id } = req.params;
    const book = books.find((el) => el.id === id);

    if (!book) {
        return res.status(404).send('Book not found');
    }

    res.render('update', { book });
});

router.get('/books/:id', async (req: Request, res: Response) => {
    const { books } = store;
    const { id } = req.params;
    const book = books.find((el) => el.id === id);

    if (!book) {
        return res.status(404).send('Book not found');
    }

    let viewCount = 0;
    const counterUrl = process.env.COUNTER_URL || 'http://localhost:3002';
    try {
        await fetch(`${counterUrl}/counter/${id}/incr`, { method: 'POST' });
        const counterRes = await fetch(`${counterUrl}/counter/${id}`);
        const data = (await counterRes.json()) as { count?: number };
        viewCount = data.count ?? 0;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Counter service error:', message);
    }

    res.render('view', { book, viewCount, user: req.user || null });
});

router.post('/books/create', upload.single('fileBook'), (req: Request, res: Response) => {
    const { books } = store;
    const { title, description, authors, favorite, fileCover, fileName } = req.body;

    const fileBook = req.file ? req.file.path : '';

    const newBook = new Book(
        title,
        description,
        authors,
        favorite === 'true' || favorite === true,
        fileCover,
        fileName,
        fileBook,
    );

    books.push(newBook);
    res.redirect(`/books/${newBook.id}`);
});

router.post('/books/:id/update', upload.single('fileBook'), (req: Request, res: Response) => {
    const { books } = store;
    const { id } = req.params;
    const { title, description, authors, favorite, fileCover, fileName } = req.body;
    const idx = books.findIndex((el) => el.id === id);

    if (idx === -1) {
        return res.status(404).send('Book not found');
    }

    const updatedBook: Book = {
        ...books[idx],
        title,
        description,
        authors,
        favorite: favorite === 'true' || favorite === true,
        fileCover,
        fileName,
    };

    if (req.file) {
        updatedBook.fileBook = req.file.path;
    }

    books[idx] = updatedBook;
    res.redirect(`/books/${id}`);
});

router.post('/books/:id/delete', (req: Request, res: Response) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex((el) => el.id === id);

    if (idx !== -1) {
        books.splice(idx, 1);
        res.redirect('/books');
    } else {
        res.status(404).send('Book not found');
    }
});

router.get('/', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect('/books');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.render('home', { user: req.user || null });
});

router.get('/api/books', async (req: Request, res: Response) => {
    try {
        const repo = container.get(BooksRepository);
        const books = await repo.getBooks();
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.get('/api/books/:id', async (req: Request, res: Response) => {
    try {
        const repo = container.get(BooksRepository);
        const book = await repo.getBook(req.params.id as string);
        if (!book) {
            return res.status(404).json('404 | page not found');
        }
        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.post('/api/books/', upload.single('fileBook'), async (req: Request, res: Response) => {
    try {
        const { title, description, authors, favorite, fileCover, fileName } = req.body;
        const fileBook = req.file ? req.file.path : '';

        const repo = container.get(BooksRepository);
        const newBook = await repo.createBook({
            id: uuid(),
            title: title || '',
            description: description || '',
            authors: authors || '',
            favorite: favorite === 'true' || favorite === true ? 'true' : 'false',
            fileCover: fileCover || '',
            fileName: fileName || '',
            fileBook,
        });

        res.status(201);
        res.json(newBook);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.put('/api/books/:id', async (req: Request, res: Response) => {
    try {
        const { title, description, authors, favorite, fileCover, fileName } = req.body;
        const repo = container.get(BooksRepository);
        const book = await repo.updateBook(req.params.id as string, {
            title, description, authors, favorite, fileCover, fileName,
        });

        if (!book) {
            return res.status(404).json('404 | page not found');
        }
        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.delete('/api/books/:id', async (req: Request, res: Response) => {
    try {
        const repo = container.get(BooksRepository);
        const result = await repo.deleteBook(req.params.id as string);
        if (!result) {
            return res.status(404).json('404 | page not found');
        }
        res.json('ok');
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.get('/api/books/:id/download', async (req: Request, res: Response) => {
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

export default router;
