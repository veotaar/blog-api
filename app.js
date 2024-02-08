const express = require('express');
const cors = require('cors');
const passport = require('passport');
const indexRouter = require('./routes/index');
const helmet = require('helmet');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

mongoose.connect(process.env.DB_STRING);
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
  }
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error'));

const app = express();

require('./config/passport')(passport);
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());

app.use('/api', indexRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

app.listen(process.env.PORT);
