# Flick List

## Overview

Ever found yourself stuck on what movie to watch? Or had someone recommend you a movie, only to forget what it was called?

Flick List is a web app that allows users to keep an aggregate list of movies they want to watch. Users can register and login. Once they're logged in, they can add/delete movies to their personal list, or browse a list of movies collected from all users. Users can check off a movie once they've watched it and rate it. Movies can be filtered based on genre, alphabetical order, rating, etc. Additionally, users have the ability to click on a random button to generate a random movie recommendation from the total list of movies.

## Data Model

The application will store Users and Movies

* each user has a list of movies (via references)

An Example User:

```javascript
{
  username: "movielover",
  hash: // a password hash,
  movies: // an array of references to Movies
}
```

An Example Movie:

```javascript
{
  name: "Inception",
  director: "Christopher Nolan",
  year: 2010,
  genre: "Sci-Fi",
  seen: false
}
```


## [Link to Commented First Draft Schema](db.js) 

## Wireframes

(___TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc._)

/my-movies - page for viewing a user's movie list

![list create](documentation/list-create.png)

/movies - page for showing all movies added by all users

![list](documentation/list.png)

/random/slug - page for showing a random movie suggestion

![list](documentation/list-slug.png)

## Site map

(___TODO__: draw out a site map that shows how pages are related to each other_)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

## User Stories or Use Cases

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can add a movie to my personal list (either by creating a new movie or adding one from the existing total movies list)
4. as a user, I can view all movies (and filter them based on genre, rating, etc.)
5. as a user, I can cross off a movie that I have watched & rate it.
7. as a user, I can get a random movie recommendation from the total movie list.

## Research Topics

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    * And account has been made for testing; I'll email you the password
    * see <code>cs.nyu.edu/~jversoza/ait-final/register</code> for register page
    * see <code>cs.nyu.edu/~jversoza/ait-final/login</code> for login page
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points


## [Link to Initial Main Project File](app.js) 

## Annotations / References Used

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)
