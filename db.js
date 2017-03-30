//db.js
//FIRST DRAFT DATA MODEL

//mongoose setup
const mongoose = require('mongoose');

//url slugs setup
const urlSlugs = require('mongoose-url-slugs');

//define user schema
const User = new mongoose.Schema({
	//username provided by auth plugin
	//password hash provided by auth plugin
	movies: [Movie]
});

//define movie schema
const Movie = new mongoose.Schema({
	name: {type: String, required: true},
	director: {type: String, required: false},
	genre: {type: String, required: true},
	year: {type: Integer, required: false},
	rating: {type: Integer},
	seen: {type: Boolean, default: false}
	//slug
});

//register/define the models
mongoose.model("User", User);
mongoose.model("Movie", Movie);

//connect to the database
mongoose.connect('mongodb://localhost/finalproj');