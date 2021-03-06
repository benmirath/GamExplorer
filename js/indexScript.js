var baseURL = 'http://www.giantbomb.com/api/',
	APIKey = '7023adaa7496b3c4d196e749b4b60ce33cb14728',
	APIFormat = '&format=jsonp&json_callback=setDataObject',
	APIModifier = '&field_list',
	APISearch = '&query=';
	APISearchParameters = '&format=jsonp&json_callback=searchCallback';

var dataObject,
	dataArray = [],
	currentGames = [],
	sort = [];

//list of data object
var	currentGamesData = [],
	currentSortGenre = [],
	currentSortTheme = [],
	currentSortConcept = [],
	currentData = {
		gamesData : currentGamesData, 
		genreData : currentSortGenre, 
		themeData : currentSortTheme, 
		conceptData : currentSortConcept
	};

var sortType;
var gameField,
	buttonField,
	gameSearchResult = '.searchResult',
	dataHidden = true;

var userMap = new app.dataVisObject ();
userMap.target = "#game-vis";
userMap.init();

$(document).ready (function(){
	init();
	backgroundInit();
}); 

function init () {
	gameField = $('#gameField');
	buttonField = $('#submitVal');
	gameSearch = $('#gameSearch');
	gameSearchSubmit = $('#gameSearchSubmit');
	
	$(gameSearchSubmit).click(function (e) {
		e.preventDefault();
		$('#searchLoading').css('opacity', 1);
		requestGameDataSearch();
	});
	
	$('#sortType').change(function (e) {
		e.preventDefault();
		sortType = $("#sortType").val();
		renderList();
		processData(userMap, currentGamesData, sortType);
	});
	$('#displayType').change(function (e) {
		e.preventDefault();
		switch ($('#displayType').val()) {
			case "List":
				$('#textResults').addClass('active');
				$('#chartResults').removeClass('active');
				break;
			case "Chart":
				$('#textResults').removeClass('active');
				$('#chartResults').addClass('active');
				break;
		}
		renderList();
		processData(userMap, currentGamesData, sortType);
	});

}

function assignDynamicEvents () {
	$('.searchResult').click(function (e) {
		e.preventDefault();
		requestGameDataSingle(e);
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
			for (var obj in currentGamesData) {
				if ($("#sortType").val() == "Genre") {
					for (var obj2 in currentGamesData[obj].genres) {
						if (currentGamesData[obj].genres[obj2].name === tar.html()) {
							tar.addClass('active');
							$('.gameResultItemHeader[data-game_id="'+currentGamesData[obj].id+'"]').addClass('active');
							break;
						}
					}
				} 
				else if ($("#sortType").val() == "Themes") {
					for (var obj2 in currentGamesData[obj].themes) {
						if (currentGamesData[obj].themes[obj2].name === tar.html()) {
							tar.addClass('active');
							$('.gameResultItemHeader[data-game_id="'+currentGamesData[obj].id+'"]').addClass('active');
							break;
						}
					}
				} 
				else if ($("#sortType").val() == "Concepts") {
					for (var obj2 in currentGamesData[obj].concepts) {
						if (currentGamesData[obj].concepts[obj2].name === tar.html()) {
							tar.addClass('active');
							$('.gameResultItemHeader[data-game_id="'+currentGamesData[obj].id+'"]').addClass('active');
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


	$('.gameResultItemHeader').click(function (e) {
		var tar = $(this);
		var tarData = _.find(currentGamesData, function (obj) {return obj.id == tar.data('game_id')});
		if (!tar.hasClass('active')) {
			$('.gameResultItemHeader.active').each (function (e) {
				$(this).removeClass('active');
			});
			$('.sortResultItem.active').each (function (e) {
				$(this).removeClass('active');
			});

			tar.addClass('active');

			// for (var obj in currentData) {
			if ($("#sortType").val() == "Genre") {
				for (var obj in tarData.genres) {
					for (var obj2 in currentSortGenre) {
						if (tarData.genres[obj].name === currentSortGenre[obj2]) {
							$('.sortResultItem[data-genre_name="'+currentSortGenre[obj2]+'"]').addClass('active');
						}
							
					}
				}
			} 
			else if ($("#sortType").val() == "Themes") {
				for (var obj in tarData.themes) {
					for (var obj2 in currentSortTheme) {
						if (tarData.themes[obj].name === currentSortTheme[obj2]) {
							$('.sortResultItem[data-theme_name="'+tarData.themes[obj].name+'"]').addClass('active');
						}
							
					}
				}
			} 
			else if ($("#sortType").val() == "Concepts") {
				for (var obj in tarData.concepts) {
					for (var obj2 in currentSortConcept) {
						if (tarData.concepts[obj].name === currentSortConcept[obj2]) {
							$('.sortResultItem[data-concept_name="'+currentSortConcept[obj2]+'"]').addClass('active');
						}
							
					}
				}
			}

			// }
		} else {
			$('.gameResultItemHeader.active').each (function (e) {
			$(this).removeClass('active');
			});
			$('.sortResultItem.active').each (function (e) {
				$(this).removeClass('active');
			});
		}
	});
}

function requestGameDataSearch () {
	var myURL = "http://www.giantbomb.com/api/search/";
	$.ajax({
		url : myURL,
		crossDomain : true,
		dataType : "jsonp",
		xhrFields : {
			withCredentials : true
		},
		headers: {
		     'Authorization': "Basic XXXXX"
		},
		data : {
			api_key : APIKey,
			query : removeSpaces(gameSearch.val()),
			field_list : 'name,id,platforms',
			resources : "game",
			format : 'jsonp',
			json_callback : "searchCallback"
		}
	});
}
function requestGameDataSingle (target) {
	var gameID = $(target.currentTarget).data('game_id');
	var myURL = "http://www.giantbomb.com/api/game/3030-"+gameID;
	$.ajax({
		url : myURL,
		crossDomain : true,
		dataType : "jsonp",
		xhrFields : {
			withCredentials : true
		},
		headers: {
		     'Authorization': "Basic XXXXX"
		},
		data : {
			api_key : APIKey,
			field_list : 'id,name,deck,concepts,themes,genres',
			format : 'jsonp',
			json_callback : "setDataObject"
		}
	});

	$('#searchResultField').empty();
}
function requestGameDataSingleId (id) {
	var gameID = id;
	var myURL = "http://www.giantbomb.com/api/game/3030-"+gameID;
	$.ajax({
		url : myURL,
		crossDomain : true,
		dataType : "jsonp",
		xhrFields : {
			withCredentials : true
		},
		headers: {
		     'Authorization': "Basic XXXXX"
		},
		data : {
			api_key : APIKey,
			field_list : 'id,name,deck,concepts,themes,genres',
			format : 'jsonp',
			json_callback : "setDataObject"
		}
	});

	$('#searchResultField').empty();
}

function searchCallback (data) {
	$('#gameSearch').val('');
	$('#searchResultField').empty();
	$('#searchLoading').css('opacity', 0);

	if (data.results.length > 1) {
		var returnList = $('<ul class="returnList"></ul>');
		for (result in data.results) {

			if (data.results[result].platforms) {
				var platformLimit = 2;
				var platformList = "";
				for (var i = 0; i < data.results[result].platforms.length; i++) {
					if (i >= platformLimit) {
						platformList += data.results[result].platforms[i].name + ', ...';
						break;
					}
					platformList += data.results[result].platforms[i].name;
					if (i + 1 < data.results[result].platforms.length) {
						platformList += ", "
					}
				}

				returnList.append($('<li class="searchResult" data-game_id="' + data.results[result].id + '">'+data.results[result].name+'</li><p class="platform">' + platformList + '</p>'));
			} else {
				returnList.append($('<li class="searchResult" data-game_id="' + data.results[result].id + '">'+data.results[result].name+'</li>'));
			}
		}
		$('#searchResultField').append($('<h2>Your search returned multiple items. Which were you looking for?</h2>'));
		$('#searchResultField').append(returnList);
		assignDynamicEvents();
		// logic to list search results
	} else if (data.results.length > 1) {
		var gameID = results[0].id;
		requestGameDataSingleId(gameID);
	} else {
		$('#searchResultField').append($('<h2>Your search returned no items. Please modify your search and try again.</h2>'));
	}
}

function setDataObject (data) {
	if (dataHidden) {
		dataHidden = false;
		$('.hidden').each(function( index ) {
			$(this).removeClass('hidden');
		});
	}
		

	if (hasDuplicatesNameCheck(currentGamesData, data.results.name) === false) {
		currentGamesData.push(data.results);
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

	sortType = $("#sortType").val();
	renderList();
	processData(userMap, currentGamesData, sortType);
}


function renderList () {
	sort = [];
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
	currentGames = [];
	currentSort = [];

	sort = cleanArray(sort);
	for (var i = 0; i < currentGamesData.length; i++) {
		currentGames.push('<li class="gameResultItem"><h3 class="gameResultItemHeader" data-game_id="' +currentGamesData[i].id+ '" >'+currentGamesData[i].name+'</h3><p class="gameResultItemBody">'+currentGamesData[i].deck+'</p></li>');	
		if (sort.length > 0) {
			if ($("#sortType").val() == "Genre") {
				for (var x = 0; x < currentGamesData[i].genres.length; x++) {
					if (!hasDuplicates(sort, currentGamesData[i].genres[x].name))
						currentSort.push('<li><h3 class="sortResultItem" data-genre_name="' + currentGamesData[i].genres[x].name + '">'+currentGamesData[i].genres[x].name+'</h3></li>');
				}
			} else if ($("#sortType").val() == "Themes") {
				for (var x = 0; x < currentGamesData[i].themes.length; x++) {
					if (!hasDuplicates(sort, currentGamesData[i].themes[x].name))
						currentSort.push('<li><h3 class="sortResultItem" data-theme_name="' + currentGamesData[i].themes[x].name + '">'+currentGamesData[i].themes[x].name+'</h3></li>');
				}
			} else if ($("#sortType").val() == "Concepts") {
				for (var x = 0; x < currentGamesData[i].concepts.length; x++) {
					if (!hasDuplicates(sort, currentGamesData[i].concepts[x].name))
						currentSort.push('<li><h3 class="sortResultItem" data-concept_name="' + currentGamesData[i].concepts[x].name + '">'+currentGamesData[i].concepts[x].name+'</h3></li>');
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


//UTILITY FUNCTIONS
function removeSpaces (string) {

	return  string.split(' ').join('+');
}
function hasDuplicates(array, stringMatch) {
    var log = 0
    for (var i = 0; i < array.length; ++i) {
    	if (array[i] === stringMatch)
    		log++;
    }

    if (log > 1) return true;
    else return false;
}
function hasDuplicatesNameCheck(array, stringMatch) {
    var log = 0
    for (var i = 0; i < array.length; ++i) {
    	if (array[i].name === stringMatch)
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

