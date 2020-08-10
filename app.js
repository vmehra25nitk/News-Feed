require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const NewsAPI = require('newsapi');
const apiKey = process.env.NEWS_API_KEY;
const newsapi = new NewsAPI(apiKey);
const path = require('path');

const db = require('./config/keys').MongoURI;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');

require('./config/passport')(passport);

mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const app = express();

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const secret = process.env.SECRET;


app.use(
	session({
		secret: secret,
		resave: false,
        saveUninitialized: true,
        //cookie: {secure: true}
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes/user'));

const User = require('./models/user');


const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server started on ${PORT}`));