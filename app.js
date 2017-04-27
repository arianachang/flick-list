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

//flash middleware setup
var flash = require('connect-flash');
app.use(flash());

//passport setup
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, {'message':'Incorrect username.'});
      }
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
		if(err) {
			console.log(err);
		}
		if(!passwordMatch) {
			console.log('incorrect pw');
			return done(null, false, {'message':'Incorrect password.'});
		}
		return done(null, user);
	}); //end bcrypt compare
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
             {'message':'User already exists.'});
        } else {
          // create the user & set user's local credentials
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;

          //check if pw is greater than 8 chars
          if(password.length < 8) {
          	return done(null, false, {'message': 'Password must be at least 8 characters'});
          }
          else {
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
          }
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
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

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
	if(!req.user) {
		//if user not signed in, go to log in
		res.render('signin', {error: req.flash('error')});
	}
	else {
		res.render('userlist', {user:req.user});
	}
});

app.post('/',
  passport.authenticate('local', { successRedirect: '/mylist',
                                   failureRedirect: '/',
                                   failureFlash: true })
);

app.get('/signup', (req, res) => {
	//create an account page
	res.render('signup', {error: req.flash('error')});
});

app.post('/signup', passport.authenticate('signup', {
	successRedirect: '/mylist',
	failureRedirect: '/signup',
	failureFlash : true })
);

app.get('/mylist', (req, res) => {
	if(!req.user) {
		//go to login form
		res.redirect('/');
	}
	else {
		res.render('userlist', {user:req.user});
	}
});

app.post('/mylist', (req, res) => {
	//handles creating a new movie
	if(!req.body.title || !req.body.genre) {
		const msg = 'Error: Title and genre are required fields.';
		res.render('userlist', {msg:msg, user:req.user});	
	}
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
						//console.log(movie);
						res.redirect('/mylist');
					}
			});
		}
	});
});

app.post('/update', (req, res) => {
	//handles updating user movie list (delete movies, mark as seen)
	if(!req.body.seen) {
		const msg = 'Error: you didn\'t select any movies!';
		res.render('userlist', {err:msg, user:req.user});
	}
	else {
		const checked = req.body.seen;
		if(!Array.isArray(checked)) {
				User.findOneAndUpdate(
					{username: req.user.username, "movies.name":checked},
					{$set: {"movies.$.seen": true}}, (err, data) => {
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
				User.findOneAndUpdate(
					{username: req.user.username, "movies.name":checked[i]},
					{$set: {"movies.$.seen": true}}, (err, data) => {
						if(err) {
							const msg = 'Error: something went wrong, please try again';
							res.render('userlist', {msg:msg, user:req.user});
						}
				});
			}
			res.redirect('/mylist');
		}
	}
});

app.get('/movies', (req, res) => {
	//displays all movies in db
	Movie.find({}, (err, movies) => {
		if(err) {
			console.log(err);
			res.render('error', {msg:err});
		}
		else {
			res.render('movies', {movies:movies, user:req.user});
		}
	});
});

app.post('/addToList', (req, res) => {
	//handles adding movies to user movie list from total movies db
	if(!req.body.add) {
		const msg = 'Error: you didn\'t select any movies!';
		res.render('movies', {msg:msg, user:req.user});
	}
	else {
		const checked = req.body.add;
		if(!Array.isArray(checked)) {
			Movie.findOne({name:checked}, (err, movie) => {
				User.findOne({username:req.user.username, 'movies.name':checked}, (err, data) => {
					if(data) { //movie exists in user's list
						const msg = `Error: ${checked} is already in your list!`;
						exists = true;
						res.render('movies', {msg:msg, user:req.user});
					}
					else {
						User.findOneAndUpdate(
							{username: req.user.username},
							{$push: {movies:movie}}, (err, data) => {
								if(err) {
										const msg = 'Error: something went wrong, please try again';
										console.log(err);
										res.render('movies', {msg:msg, user:req.user});
									}
									else {
										//const msg = 'Success! ' + movie.name + ' was added to your list.';
										//res.render('userlist', {msg:msg, user:user});
										res.redirect('/mylist');
									}
						});//end user find one
					}//end else
				});//end user find
			});//end movie find
		}
		else {
			for(let i=0; i<checked.length; i++) {
				Movie.findOne({name:checked[i]}, (err, movie) => {
					User.findOne({username:req.user.username, 'movies.name':checked[i]}, (err, data) => {
						if(data) { //movie exists in user's list
							console.log('Error: movie is already in your list and was not added.');
						}
						else {
							User.findOneAndUpdate(
								{username: req.user.username},
								{$push: {movies:movie}}, (err, data) => {
									if(err) {
										const msg = 'Error: something went wrong, please try again';
										console.log(err);
										res.render('movies', {msg:msg, user:req.user});
									}
									else {
										msgs += 'Success! ' + checked[i] + ' was added to your list.<br>';
									}
							});//end user find one
						}//end else
					});//end user find
				});
			}
			res.redirect('/mylist');
			//const msg = 'Movies successfully added!';
			//res.render('userlist', {err:msgs, user:req.user});
		}
	}
});

app.get('/api/movies', (req, res) => {
	//filters movies in db
	let movieFilter = {};
	if(req.query) {
		const filter = req.query.filter;
		switch(filter) {
			case 'title': movieFilter.name = 1;
						break;
			case 'genre': movieFilter.genre = 1;
						break;
			case 'director': movieFilter.director = 1;
						break;
			case 'year': movieFilter.year = 1;
						break;
			case 'default': break;
		}
	}
	Movie.find({}).sort(movieFilter).exec(function(err, movies) {
		if(err) {
			console.log(error);
			res.render('error', {msg:err});
		}
		res.json(movies.map((ele) => {
			return {
				"name": ele.name,
				"director": ele.director,
				"year": ele.year,
				"genre": ele.genre
			}
		}));
	});
});

app.get('/api/user_data', function(req, res) {
	//returns value if a user is currently logged in, for use in ajaxFilter.js script
	if (req.user === undefined) {
		res.json({});
	} else {
		res.json({
			user: "true"
		});
	}
});

app.get('/api/user_movies', (req, res) => {
	//filters movies for a user's list
	if(req.user) {
		let movieFilter = {};
		let compareFn;
		if(req.query) {
			const filter = req.query.filter;
			switch(filter) {
				case 'title': compareFn = function(m1, m2) {
									m1.name.toUpperCase();
									m2.name.toUpperCase();
									if(m1.name < m2.name) {
										return -1;
									}
									if(m1.name > m2.name) {
										return 1;
									}
									return 0;
							}
							break;
				case 'genre': compareFn = compareFn = function(m1, m2) {
									m1.genre.toUpperCase();
									m2.genre.toUpperCase();
									if(m1.genre < m2.genre) {
										return -1;
									}
									if(m1.genre > m2.genre) {
										return 1;
									}
									return 0;
							}
							break;
				case 'director': compareFn = compareFn = function(m1, m2) {
									m1.director.toUpperCase();
									m2.director.toUpperCase();
									if(m1.director < m2.director) {
										return -1;
									}
									if(m1.director > m2.director) {
										return 1;
									}
									return 0;
							}
							break;
				case 'year': compareFn = compareFn = function(m1, m2) {
									if(m1.year < m2.year) {
										return -1;
									}
									if(m1.year > m2.year) {
										return 1;
									}
									return 0;
							}
							break;
				case 'seen': compareFn = compareFn = function(m1, m2) {
									if(m1.seen === true) {
										return -1;
									}
									if(m1.genre === false) {
										return 1;
									}
							}
							break;
				case 'default': break;
			}
		}
		User.findOne({username:req.user.username}).lean().exec((err, user) => {
			const copy = user.movies.slice();
			if(req.query.filter === 'default') {
				res.json(copy.map((ele) => {
					return {
						"name": ele.name,
						"director": ele.director,
						"year": ele.year,
						"genre": ele.genre,
						"seen": ele.seen
					}
				}));
			}
			else {
				const sorted = copy.sort(compareFn);
				res.json(sorted.map((ele) => {
					return {
						"name": ele.name,
						"director": ele.director,
						"year": ele.year,
						"genre": ele.genre,
						"seen": ele.seen
					}
				}));
			}
		});//end user.find
	}
	else {
		res.render('error', {msg:'You must be logged in to view this data.'});
	}
});

app.get('/random', (req, res) => {
	//displays a random movie
	Movie.aggregate({$sample: {size: 1}}, (err, data) => {
		if(err) {
			console.log(err);
			res.render('error', {msg:err});
		}
		else {
			res.render('random', {movie: data});
		}
	});
});

app.get('/logout', (req, res) => {
	//logs out the current user
	req.logout();
	res.redirect('/');
});

app.get('*', (req, res) => {
	//handles 404 page not found
	res.render('error', {msg:res.status});
});

//listen on port 3000
app.listen(process.env.PORT || 3000);