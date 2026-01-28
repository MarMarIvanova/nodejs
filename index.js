const express = require('express');
const path = require('path');

const logger = require('./middleware/logger');
const error404 = require('./middleware/err-404');
const error = require('./middleware/error-handling');
const indexRouter = require('./routs/index');

const app = express()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger)

app.use('/', indexRouter)

app.use(error404)
app.use(error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});