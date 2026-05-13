const express = require('express');
const path = require('path');
const http = require('http');
const session = require('express-session');
const { Server } = require('socket.io');

const { connect } = require('./db/mongoose');
const passport = require('./db/passport');
const { setupBookComments } = require('./socket/comments');
const logger = require('./middleware/logger');
const error404 = require('./middleware/err-404');
const error = require('./middleware/error-handling');
const indexRouter = require('./routs/index');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'library-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger);
app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, 'public')));

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