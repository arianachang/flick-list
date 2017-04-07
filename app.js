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

/*
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
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
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
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.email = req.param('email');
          newUser.firstName = req.param('firstName');
          newUser.lastName = req.param('lastName');
 
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  });
);
app.use(passport.initialize());
app.use(passport.session());
*/
//init connection to db
require('./db');

//mongoose setup
const mongoose = require('mongoose');

//retrieve constructor models
const Movie = mongoose.model("Movie");
const User = mongoose.model("User");

//route handlers
app.get('/', function(req, res) {
	//sign in home page
	res.render('signin');
});
/*
app.post('/',
  passport.authenticate('local', { successRedirect: '/mylist',
                                   failureRedirect: '/',
                                   failureFlash: true })
);
*/
app.get('/signup', (req, res) => {
	//create an account page
	res.render('signup');
});
/*
app.post('/signup', passport.authenticate('signup', {
	successRedirect: '/mylist',
	failureRedirect: '/signup',
	failureFlash : true })
);
*/
app.get('/mylist', (req, res) => {
	//adds movie to user's list
	//temporary user before i figure out authentication stuff
	User.find({username:'tempuser'}, (err, user) => {
		if(err) {
			console.log(err);
		}
		else {
			//console.log(user);
			res.render('userlist', {user:user});
		}
	});
});

app.post('/mylist', (req, res) => {
	const movie = new Movie({
		name: req.body.title,
		genre: req.body.genre
	});
	//save to movie db
	movie.save((err) => {
		if(err){
			console.log(err);
			const msg = 'Error: something went wrong, please try again';
			res.render('userlist', {msg:msg});
		}
		console.log('movie saved');
	});
	//save to user's list
	User.findOneAndUpdate(
		{username: 'tempuser'},
		{$push: {movies:movie}}, (err, user) => {
			if(err) {
				const msg = 'Error: something went wrong, please try again';
				res.render('userlist', {msg:msg});
			}
			else {
				const msg = 'Success! ' + movie.name + ' was added to your list.';
				//res.render('userlist', {msg:msg, user:user});
				res.redirect('/mylist');
			}
	});
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