//ajaxFilter.js
//script for handling filter form submit

function filterResults(event) {
	//prevent form submission
	event.preventDefault();

	//grab filter value
	const filter = document.querySelector('input[name="filter"]:checked').value;
	console.log('filter:', filter);
}

function main() {
	const filterBtn = document.querySelector('#filterBtn');
	filterBtn.addEventListener('click', filterResults);
}

document.addEventListener('DOMContentLoaded', main);
