//db.js

//mongoose setup
const mongoose = require('mongoose');

//url slugs setup
const urlSlugs = require('mongoose-url-slugs');

//define movie schema
const Movie = new mongoose.Schema({
	name: {type: String, required: true, unique: true},
	director: {type: String, required: false},
	genre: {type: String, required: true},
	year: Number,
	rating: Number,
	seen: {type: Boolean, default: false}
	//slug
});

//define user schema
const User = new mongoose.Schema({
	username: {type: String, unique: true},
	password: {type:String},
	//username provided by auth plugin
	//password hash provided by auth plugin
	movies: [Movie]
});

//register/define the models
mongoose.model("Movie", Movie);
mongoose.model("User", User);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV === 'PRODUCTION') {
	//if we're in PRODUCTION mode, then read the configration from a file
	// use blocking file io to do this...
	var fs = require('fs');
	var path = require('path');
	var fn = path.join(__dirname, 'config.json');
	var data = fs.readFileSync(fn);

	// our configuration file will be in json, so parse it and set the
	// conenction string appropriately!
	var conf = JSON.parse(data);
	var dbconf = conf.dbconf;
} else {
	// if we're not in PRODUCTION mode, then use
	dbconf = 'mongodb://localhost/ac4536';
}

//connect to the database
mongoose.connect(dbconf);