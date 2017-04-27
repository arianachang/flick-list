//userFilter.js
//script for handling user filter form submit

function filterResults(event) {
	//prevent form submission
	event.preventDefault();

	//grab filter value
	const filter = document.querySelector('input[name="filter"]:checked').value;

	let url = 'http://linserv1.cims.nyu.edu:11820/api/user_movies';

	if(filter) {
		url += '?filter=' + filter;
	}

	//get movie data
	const req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.addEventListener('load', function() {
		if(req.status >= 200 && req.status < 400) {
			const movies = JSON.parse(req.responseText);
			let updateList = '';
			const str = movies.map(function(movie) {
				if(movie.seen === true) {
					let dir = '';
					if(movie.director) {
						dir = ' | Director: ' + movie.director;
					}
					updateList = `<li><s>${movie.name} <i>${movie.year}</i> | Genre: ${movie.genre}${dir}</s></li>`;
				}
				else {
					let dir = '';
					if(movie.director) {
						dir = ' | Director: ' + movie.director + ' ';
					}
					updateList = `<li>${movie.name} <i>${movie.year}</i> | Genre: ${movie.genre}${dir} | Seen It? <input type="checkbox" name="seen" value="${movie.name}"></li>`;
				}
				return updateList;
			}).reduce(function(acc, el){
				return acc+el;
			}, '');
			const movieList = document.querySelector('#movie-list');
			movieList.innerHTML = str;
		}
	});
	req.addEventListener('error', function(e) {
		const err = document.createElement('p');
		err.innerHTML = '<p style="color:red;">Something went wrong, please try again</p>';
		document.querySelector('.main').appendChild(err);
	});
	req.send();
}

function main() {
	const filterBtn = document.querySelector('#filterBtn');
	filterBtn.addEventListener('click', filterResults);
}

document.addEventListener('DOMContentLoaded', main);
