import 'reflect-metadata';
import express from 'express';
import path from 'path';
import http from 'http';
import session from 'express-session';
import { Server } from 'socket.io';

import { connect } from './db/mongoose';
import passport from './db/passport';
import { setupBookComments } from './socket/comments';
import logger from './middleware/logger';
import error404 from './middleware/err-404';
import error from './middleware/error-handling';
import indexRouter from './routs/index';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const projectRoot = path.join(__dirname, '..');

app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'library-secret-key',
        resave: false,
        saveUninitialized: false,
    }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger);
app.use('/', indexRouter);
app.use(express.static(path.join(projectRoot, 'public')));

app.use(error404);
app.use(error);

setupBookComments(io);

const PORT = process.env.PORT || 3001;

connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
