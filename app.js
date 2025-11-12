const express = require('express');
const cors = require('cors');
const passport = require('passport');
const indexRouter = require('./routes/index');
const helmet = require('helmet');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
// const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');

mongoose.connect(`${process.env.DB_STRING}?retryWrites=true&w=majority`);
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
  }
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error'));

const limiter = rateLimit({
  windowMs: 4 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    if (!req.ip) {
      return req.socket.remoteAddress;
    }

    // strip the port number from the IP address
    return req.ip.replace(/:\d+[^:]*$/, '');
  }
});

const app = express();
app.set('trust proxy', 1);

require('./config/passport')(passport);
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: [
    process.env.CMS_URL,
    process.env.PUBLIC_URL,
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);
// app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });

app.use('/api', indexRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

app.listen(process.env.PORT);
