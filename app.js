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
	secret: require('crypto').randomBytes(64).toString('hex'),
	resave: false,
	saveUninitialized: true
};
app.use(session(sessionOptions));

//bcrypt setup
const bcrypt = require('bcrypt');

//passport setup
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
		if(err) {
			console.log(err);
		}
		if(!passwordMatch) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		return done(null, user);
	}); //end bcrypt compare
     /* if (!validPassword(user, password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);*/
    });
  }
));
passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in Sign Up: ' + err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User already exists'));
        } else {
          // create the user & set user's local credentials
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          bcrypt.hash(password, 10, (err, hash) => {
			if(err) {
				console.log(err);
			}
			newUser.password = hash;

			// save the user
            newUser.save(function(err) {
            	if (err){
             		console.log('Error in Saving User: ' + err);  
              	throw err;  
            }
            console.log('User Registration Successful');    
            return done(null, newUser);
          });
		  });//end bcrypt hash
        }//end else
      });//end findOne
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log('serializing user: ');
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        console.log('deserializing user:', user);
        done(err, user);
    });
});

//flash middleware setup
var flash = require('connect-flash');
app.use(flash());

//init connection to db
require('./db');

//mongoose setup
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Schema.ObjectId;

//retrieve constructor models
const Movie = mongoose.model("Movie");
const User = mongoose.model("User");

//route handlers
app.get('/', function(req, res) {
	//sign in home page
	res.render('signin');
});

app.post('/',
  passport.authenticate('local', { successRedirect: '/mylist',
                                   failureRedirect: '/',
                                   failureFlash: true })
);

app.get('/signup', (req, res) => {
	//create an account page
	res.render('signup');
});

app.post('/signup', passport.authenticate('signup', {
	successRedirect: '/mylist',
	failureRedirect: '/signup',
	failureFlash : true })
);

app.get('/mylist', (req, res) => {
	//displays user movie list
	/*User.find({'_id' : ObjectId(req.session.passport.user)}, (err, user) => {
		if(err) {
			console.log(err);
		}
		else {
			res.render('userlist', {user:user});
		}
	});*/
	if(!req.user) {
		//go to login form
		res.redirect('/');
	}
	else {
		res.render('userlist', {user:req.user});
	}
});

app.post('/mylist', (req, res) => {
	//handles adding a movie to list
	const movie = new Movie({
		name: req.body.title,
		genre: req.body.genre,
		director: req.body.director,
		year: req.body.year
	});
	//save to movie db
	movie.save((err) => {
		if(err){
			console.log(err);
			const msg = 'Error: something went wrong, please try again';
			res.render('userlist', {msg:msg, user:req.user});
		}
		else {
			console.log('movie saved');
			//save to user's list
			User.findOneAndUpdate(
				{username: req.user.username},
				{$push: {movies:movie}}, (err, user) => {
					if(err) {
						const msg = 'Error: something went wrong, please try again';
						res.render('userlist', {msg:msg, user:req.user});
					}
					else {
						const msg = 'Success! ' + movie.name + ' was added to your list.';
						//res.render('userlist', {msg:msg, user:user});
						res.redirect('/mylist');
					}
			});
		}
	});
});

app.post('/update', (req, res) => {
	//handles updating movie list
	const checked = req.body.seen;
	console.log(checked);
	if(checked.length === 1) {
			User.findOneAndUpdate(
				{username: req.user.username},
				{$set: {"movies.$.seen":true}}, (err, data) => {
					if(err) {
						const msg = 'Error: something went wrong, please try again';
						res.render('userlist', {msg:msg, user:req.user});
					}
					else {
						res.redirect('/mylist');
					}
			});
	}
	else {
		for(let i=0; i<checked.length; i++) {
			console.log(checked[i]);
			let value = 'movies.'+ checked[i] + 'seen';
			User.findOneAndUpdate(
				{name: req.user.username},
				{$set: {value:true}}, (err, data) => {
					if(err) {
						const msg = 'Error: something went wrong, please try again';
						res.render('userlist', {msg:msg, user:req.user});
					}
					console.log(data);
			});
		}
		res.redirect('/mylist');

	}
});

app.get('/random', (req, res) => {
	//displays a random movie
	//res.render('random', {movie: movie});
});

app.get('/:list/:filter', (req, res) => {
	const list = req.params.list; //either user list or all movies list
	const filter = req.params.filter;
	//filters movie recommendations for all movies
});

//listen on port 3000
app.listen(process.env.PORT || 3000);