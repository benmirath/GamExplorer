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
	dataHidden = true;

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
	dataArray.push(dataObject.results);
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
	for (var i = 0; i < currentData.length; i++) {
		currentGames.push('<div><h3>'+currentData[i].results.name+'</h3><div><p>'+currentData[i].results.deck+'</p>');	
		if (sort.length > 0) {
			currentGames.push('<ul>');
			if ($("#sortType").val() == "Genre") {
				for (var x = 0; x < currentData[i].results.genres.length; x++) {
					if (hasDuplicates(sort, currentData[i].results.genres[x].name))
						currentGames.push('<li class="active">'+currentData[i].results.genres[x].name+'</li>');
					else
						currentGames.push('<li>'+currentData[i].results.genres[x].name+'</li>');
				}
			} else if ($("#sortType").val() == "Themes") {
				for (var x = 0; x < currentData[i].results.themes.length; x++) {
					if (hasDuplicates(sort, currentData[i].results.themes[x].name))
						currentGames.push('<li class="active">'+currentData[i].results.themes[x].name+'</li>');
					else
						currentGames.push('<li>'+currentData[i].results.themes[x].name+'</li>');
				}
			} else if ($("#sortType").val() == "Concepts") {
				for (var x = 0; x < currentData[i].results.concepts.length; x++) {
					if (hasDuplicates(sort, currentData[i].results.concepts[x].name))
						currentGames.push('<li class="active">'+currentData[i].results.concepts[x].name+'</li>');
					else
						currentGames.push('<li>'+currentData[i].results.concepts[x].name+'</li>');
				}
			}
			currentGames.push('</ul>');
		}
		currentGames.push('</div></div>');
	}
	$('#currentGamesField').empty();
	$('#currentGamesField').append(currentGames.join(''));
}

function searchCallback (data) {
	test = data;
	console.log(test);

	if (data.results.length > 1) {
		var returnList = $('<ul class="returnList"></ul>');
		for (result in data.results) {
			returnList.append($('<li class="searchResult">'+data.results[result].name+'</li>'));
		}
		$('#searchResultField').append($('<h2>Your search returned multiple items. Which were you looking for?</h2>'));
		$('#searchResultField').append(returnList);
		// logic to list search results
	} else {
		// logic to add the single game
	}
}


function init () {
	gameField = $('#gameField');
	buttonField = $('#submitVal');
	$(buttonField).click(function (e) {
		e.preventDefault();
		var myURL = baseURL+'game/3030-'+convertGameValue(gameField.val())+APIKey+APIFormat;
		console.log(myURL);
		$.ajax({
			url : myURL,
			dataType : 'jsonp',
			success : function (response) {
				console.log(response);
			}
		});
	});
	gameSearch = $('#gameSearch');
	gameSearchSubmit = $('#gameSearchSubmit');
	$(gameSearchSubmit).click(function (e) {
		e.preventDefault();
		var myURL = baseURL + 'search'+APIKey+'&query='+gameSearch.val()+'&resources=game&format=jsonp&json_callback=searchCallback';
		console.log(myURL);
		$.ajax({
			url : myURL,
			// dataType : 'jsonp',
			success : function (response) {
				// var obj = response;
				// test = response;
				// console.log(response);
				// console.log(obj);

				// if (response)
			}
		});
	});
}
var test;

function convertGameValue (gameString) {
	switch (gameString) {
		case "Cave Story":
		return list.CaveStory;

		case "Thomas was Alone":
		return list.ThomasWasAlone;

		case "Transistor":
		return list.Transistor;
		
		case  "Bastion":
		return list.Bastion;
		
		case "Valdis Story: Abbysal City":
		return list.ValdisStory;
		
		case "The Last of Us":
		return list.LastOfUs;
		
		case  "Uncharted 3":
		return list.Uncharted3;
		
		case "Dark Souls":
		return list.DarkSouls;
		
		case "Dark Souls 2":
		return list.DarkSouls2;
		
		case "The Elder Scrolls V: Skyrim":
		return list.Skyrim;
		
		case "Zelda: A Link Between Worlds":
		return list.ZeldaLinkBetweenWorlds;

		default:
		return "undefined";
	}
}

var list = {
	CaveStory : 20124,
	ThomasWasAlone : 38825,
	Transistor : 42012,
	Bastion : 32085,
	ValdisStory : 43891,
	BrokenAge : 37448,
	Uncharted3 : 32982,
	LastOfUs : 36989,
	DarkSouls : 32697,
	DarkSouls2 : 40798,
	Skyrim : 33394,
	ZeldaLinkBetweenWorlds : 42402
};

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
    	if (array[i].results.name === stringMatch)
    		log++;
    }
    if (log > 0) return true;
    else return false;
}

$(document).ready (function(){
	init();
	backgroundInit();
}); 