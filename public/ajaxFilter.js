//ajaxFilter.js
//script for handling movie filter form submit

function filterResults(event) {
	//prevent form submission
	event.preventDefault();

	//see if a user is logged in
	const loggedIn = userLoggedIn();

	//grab filter value
	const filter = document.querySelector('input[name="filter"]:checked').value;

	let url = 'http://linserv1.cims.nyu.edu:11820/api/movies';

	if(filter) {
		url += '?filter=' + filter;
	}

	//get movie data
	const req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.addEventListener('load', function() {
		if(req.status >= 200 && req.status < 400) {
			const movies = JSON.parse(req.responseText);
			let addToList = '';
			const str = movies.map(function(movie) {
				if(loggedIn) {
					addToList = `<td><center><input type="checkbox" name="add" value="${movie.name}"></center></td>`;
				}
				return '<tr><td>' + movie.name + '</td><td>' + movie.year + '</td><td>' + movie.director + '</td><td>' + movie.genre + '</td>' + addToList + '</tr>';
			}).reduce(function(acc, el){
				return acc+el;
			}, '');
			const movieTable = document.querySelector('#movie-list');
			movieTable.innerHTML = str;
		}
	});
	req.addEventListener('error', function(e) {
		document.querySelector('.movies').appendChild('Something went wrong, please try again');
	});
	req.send();
}

function userLoggedIn() {
	//returns true if a user is currently logged in, false if not
	let loggedIn = false;
	const userReq = new XMLHttpRequest();
	userReq.open('GET', 'http://linserv1.cims.nyu.edu:11820/api/user_data', false);
	userReq.addEventListener('load', function() {
		if(userReq.status >= 200 && userReq.status < 400) {
			const data = JSON.parse(userReq.responseText);
			if(data.user) {
				loggedIn = true;
			}
		}
	});
	userReq.addEventListener('error', function(e) {
		console.log('something happened', e);
	});
	userReq.send();
	return loggedIn;
}

function main() {
	const filterBtn = document.querySelector('#filterBtn');
	filterBtn.addEventListener('click', filterResults);
}

document.addEventListener('DOMContentLoaded', main);
