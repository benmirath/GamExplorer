//top 25 games of 2014
//top 25 games of 2013
//top 25 rpgs (metacritic)
//top 25 shooters (metacritic)
//top 25 indies (metacritic)

var chart_2013 = new app.dataVisObject (),
	chart_2012 = new app.dataVisObject ();
	// chart_rpgs = new app.dataVisObject (),
	// chart_shooters = new app.dataVisObject (),
	// chart_indies = new app.dataVisObject ();



$(document).ready(function(){
	chart_2013.target = "#game-vis-2013";
	chart_2013.init();

	chart_2012.target = "#game-vis-2012";
	chart_2012.init();

	//variables for example lists to be added in down the line
	// chart_rpgs.target = "#game-vis-rpgs";
	// chart_rpgs.init();
	// chart_shooters.target = "#game-vis-shooters";
	// chart_shooters.init();
	// chart_indies.target = "#game-vis-indies";
	// chart_indies.init();

	processData(chart_2013, top2013, $('#sortType_example').val());
	processData(chart_2012, top2012, $('#sortType_example').val());
	$('#sortType_example').change(function (e) {
		e.preventDefault();
		processData(chart_2013, top2013, $("#sortType_example").val());
		processData(chart_2012, top2012, $("#sortType_example").val());
	});
});