const express = require('express');
const cors = require('cors');
const indexRouter = require('./routes/index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);

app.listen(process.env.PORT);
