var baseURL = 'http://www.giantbomb.com/api/',
	APIKey = '/?api_key=7023adaa7496b3c4d196e749b4b60ce33cb14728',
	APIFormat = '&format=jsonp&json_callback=setDataObject',
	APIModifier = '&field_list',
	APISearch = '&query=';
	APISearchParameters = '&format=jsonp&json_callback=searchCallback';

var dataObject,
	dataArray = [],
	currentGames = [],
	currentData = [],
	sort = [],
	currentSortGenre = [],
	currentSortTheme = [],
	currentSortConcept = [];

var gameField,
	buttonField,
	gameSearchResult = '.searchResult',
	dataHidden = true;

//CurrentData holds the array of data received from server


function setDataObject (data) {
	if (dataHidden) {
		dataHidden = false;
		$('.hidden').each(function( index ) {
			$(this).removeClass('hidden');
		});
	}
		

	if (hasDuplicatesNameCheck(currentData, data.results.name) === false) {
		dataObject = data;
		currentData.push(data);
		if (data.results.genres.length > 0) {
			for (var uno = 0; uno < data.results.genres.length; uno++) {
				data.results.genres[uno].duplicate = false;
				currentSortGenre.push(data.results.genres[uno].name);
			}	
		}
		if (data.results.themes.length > 0) {
			for (var deuce = 0; deuce < data.results.themes.length; deuce++) {
				data.results.themes[deuce].duplicate = false;
				currentSortTheme.push(data.results.themes[deuce].name);
			}	
		}
		if (data.results.concepts.length > 0) {
			for (var tres = 0; tres < data.results.concepts.length; tres++) {
				data.results.concepts[tres].duplicate = false;
				currentSortConcept.push(data.results.concepts[tres].name);
			}	
		}
	}
	renderList();
}

function renderList () {
	sort = [];
	if ($('#sortType').val() != "Select Sort Value") {
		switch ($('#sortType').val()) {
			case "Genre":
			sort = currentSortGenre;
			break;

			case "Themes":
			sort = currentSortTheme;
			break;

			case "Concepts":
			sort = currentSortConcept;
			break;
		}
	}
	currentGames = [];
	currentSort = [];

	sort = cleanArray(sort);
	console.log(sort);
	for (var i = 0; i < currentData.length; i++) {
		currentGames.push('<li class="gameResultItem"><h3 class="gameResultItemHeader" data-game_id="' +currentData[i].results.id+ '" >'+currentData[i].results.name+'</h3><p class="gameResultItemBody">'+currentData[i].results.deck+'</p></li>');	
		if (sort.length > 0) {
			if ($("#sortType").val() == "Genre") {
				for (var x = 0; x < currentData[i].results.genres.length; x++) {
					if (!hasDuplicates(sort, currentData[i].results.genres[x].name))
						currentSort.push('<li><h3 class="sortResultItem">'+currentData[i].results.genres[x].name+'</h3></li>');
				}
			} else if ($("#sortType").val() == "Themes") {
				for (var x = 0; x < currentData[i].results.themes.length; x++) {
					if (!hasDuplicates(sort, currentData[i].results.themes[x].name))
						currentSort.push('<li><h3 class="sortResultItem">'+currentData[i].results.themes[x].name+'</h3></li>');
				}
			} else if ($("#sortType").val() == "Concepts") {
				for (var x = 0; x < currentData[i].results.concepts.length; x++) {
					if (!hasDuplicates(sort, currentData[i].results.concepts[x].name))
						currentSort.push('<li><h3 class="sortResultItem">'+currentData[i].results.concepts[x].name+'</h3></li>');
				}
			}
		}
		currentGames = cleanArray(currentGames);
		currentSort = cleanArray(currentSort);
	}
	$('#currentGamesField').empty();
	$('#currentGamesField').append(currentGames.join(''));
	$('#currentSortField').empty();
	$('#currentSortField').append(currentSort.join(''));
	assignDynamicEvents();
}

function searchCallback (data) {
	if (data.results.length > 1) {
		console.log(data);
		var returnList = $('<ul class="returnList"></ul>');
		for (result in data.results) {
			console.log();
			returnList.append($('<li class="searchResult" data-game_id="' + data.results[result].id + '">'+data.results[result].name+'</li>'));
		}
		$('#gameSearch').empty();
		$('#searchResultField').empty();
		$('#searchResultField').append($('<h2>Your search returned multiple items. Which were you looking for?</h2>'));
		$('#searchResultField').append(returnList);
		assignDynamicEvents();
		// logic to list search results
	} else if (data.results.length > 1) {
		console.log(data);
		var gameID = results[0].id;
		var myURL = baseURL+'game/3030-'+gameID+APIKey+APIFormat;
		$.ajax({ url : myURL });
		// logic to add the single game
	} else {
		console.log("No game result found");
	}
}

var mctest;

function assignDynamicEvents () {
	$('.searchResult').click(function (e) {
		e.preventDefault();
		var gameID = $(e.currentTarget).data('game_id');
		// console.log(gameID);
		var myURL = baseURL+'game/3030-'+gameID+APIKey+APIFormat;
		$.ajax({
			url : myURL
		});

		$('#searchResultField').empty();
	});

	$('.sortResultItem').click(function (e) {
		var tar = $(this);

		if (!tar.hasClass('active')) {
			$('.gameResultItemHeader.active').each (function (e) {
				$(this).removeClass('active');
			});
			$('.sortResultItem.active').each (function (e) {
				$(this).removeClass('active');
			});
			for (var obj in currentData) {
				if ($("#sortType").val() == "Genre") {
					console.log('In Genre');
					for (var obj2 in currentData[obj].results.genres) {
						if (currentData[obj].results.genres[obj2].name === tar.html()) {
							tar.addClass('active');
							$('.gameResultItemHeader[data-game_id="'+currentData[obj].results.id+'"]').addClass('active');
							break;
						}

					}
				} 
				else if ($("#sortType").val() == "Themes") {
					for (var obj2 in currentData[obj].results.themes) {
						if (currentData[obj].results.themes[obj2].name === tar.html()) {
							tar.addClass('active');
							$('.gameResultItemHeader[data-game_id="'+currentData[obj].results.id+'"]').addClass('active');
							break;
						}
					}
				} 
				else if ($("#sortType").val() == "Concepts") {
					for (var obj2 in currentData[obj].results.concepts) {
						if (currentData[obj].results.concepts[obj2].name === tar.html()) {
							tar.addClass('active');
							$('.gameResultItemHeader[data-game_id="'+currentData[obj].results.id+'"]').addClass('active');
							break;
						}
					}
				}

			}
		} else {
			$('.gameResultItemHeader.active').each (function (e) {
			$(this).removeClass('active');
			});
			$('.sortResultItem.active').each (function (e) {
				$(this).removeClass('active');
			});
		}
	});
	$('.gameResultItem').click(function (e) {

	});
}


function init () {
	gameField = $('#gameField');
	buttonField = $('#submitVal');
	$(buttonField).click(function (e) {
		e.preventDefault();
		renderList();
	});
	gameSearch = $('#gameSearch');
	gameSearchSubmit = $('#gameSearchSubmit');



	$(gameSearchSubmit).click(function (e) {
		e.preventDefault();
		var myURL = baseURL + 'search'+APIKey+'&query='+removeSpaces(gameSearch.val())+'&resources=game&format=jsonp&json_callback=searchCallback';
		console.log(myURL);
		$.ajax({
			url : myURL
		});
	});
}
function removeSpaces (string) {
	return  string.split(' ').join('');
}

function hasDuplicates(array, stringMatch) {
	console.log(array);
	console.log(stringMatch);
    var log = 0
    for (var i = 0; i < array.length; ++i) {
    	if (array[i] === stringMatch)
    		log++;
    }

    console.log(log);
    if (log > 1) return true;
    else return false;
}
function hasDuplicatesNameCheck(array, stringMatch) {
    var log = 0
    for (var i = 0; i < array.length; ++i) {
    	if (array[i].results.name === stringMatch)
    		log++;
    }
    if (log > 0) return true;
    else return false;
}

function cleanArray (array) {
	var uniqueNames = [];
	$.each(array, function(i, el){
	    if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
	});
	array = uniqueNames;
	return array;
}

$(document).ready (function(){
	init();
	backgroundInit();
}); 