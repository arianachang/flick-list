//ajaxFilter.js
//script for handling filter form submit

function filterResults(event) {
	//prevent form submission
	event.preventDefault();

	//see if a user is logged in
	const loggedIn = userLoggedIn();
	console.log(loggedIn);

	//grab filter value
	const filter = document.querySelector('input[name="filter"]:checked').value;

	let url = 'http://localhost:3000/api/movies';

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
			console.log(str);
			const movieTable = document.querySelector('#movie-list');
			movieTable.innerHTML = str;
		}
	});
	req.addEventListener('error', function(e) {
		console.log('something happened', e);
	});
	req.send();
}

function userLoggedIn() {
	//get user data
	let loggedIn;
	const userReq = new XMLHttpRequest();
	userReq.open('GET', 'http://localhost:3000/api/user_data', false);
	userReq.addEventListener('load', function() {
		if(userReq.status >= 200 && userReq.status < 400) {
			const user = JSON.parse(userReq.responseText);
			console.log(user);
			if(user) {
				loggedIn = true;
			}
			else {
				loggedIn = false;
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
