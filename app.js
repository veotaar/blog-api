const express = require('express');
const cors = require('cors');
const passport = require('passport');
const indexRouter = require('./routes/index');
const helmet = require('helmet');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_STRING);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error'));

const app = express();

require('./config/passport')(passport);
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());

app.use('/', indexRouter);

app.listen(process.env.PORT);
