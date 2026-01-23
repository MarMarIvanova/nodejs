const express = require('express');

const logger = require('./middleware/logger');
const error404 = require('./middleware/err-404');
const indexRouter = require('./routs/index');

const app = express()

app.use(logger)

app.use('/', indexRouter)

app.use(error404)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});