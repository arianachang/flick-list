//app.js

//express setup
const express = require('express');
const app = express();

//body parser setup
const bodyParser = require('body-parser'); //require body-parser midware to access request body
app.use(bodyParser.urlencoded({extended: false}));

//static files set up
const path = require('path');
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath)); //serve up static files anywhere

//hbs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); //bring in handlebars for templating

//sessions setup
const session = require('express-session');
const sessionOptions = {
	secret: 'secret cookie',
	resave: false,
	saveUninitialized: true
};
app.use(session(sessionOptions));

//init connection to db
require('./db');

//mongoose setup
const mongoose = require('mongoose');

//retrieve constructor models
const User = mongoose.model("User");
const Movie = mongoose.model("Movie");

//route handlers
app.get('/', function(req, res) {
	//sign in home page
	res.render('signin');
});

app.post('/', (req, res) => {
	//if username correct, go to main page
	//else, stay on signin page
});

app.get('/random', (req, res) => {
	//displays a random movie
	//res.render('random', {movie: movie});
});

app.get('/:filter', (req, res) => {
	const filter = req.params.filter;
	//filters movie recommendations for all movies
});

//listen on port 3000
app.listen(3000);