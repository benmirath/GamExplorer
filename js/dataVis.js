var map = {
	 "name": "",
	 "children": []
};

var gwlinks = [],
	wtlinks = [],
	gtlinks = [];

var diameter = 640,
    radius = 940 / 2,
    innerRadius = radius - 270,
	circlew = 940;


var cluster = d3.layout.cluster()
    .size([360, innerRadius])
	.sort(function(a, b) { 
		
		var valueA = a.size * 100
		var valueB = b.size * 100
		
		var charA = a.name.toLowerCase().charCodeAt(0)
		var charB = b.name.toLowerCase().charCodeAt(0)
		
		if(a.nodeType == 'game'){
			return d3.descending(valueA, valueB);
		} else {
			return d3.descending(valueB - charB, valueA - charA); 
		}
	})
    .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();
var svg = d3.select("#game-vis").append("svg")
    	.attr("width", $('#wrapper').outerWidth())
    	.attr("height", diameter+240)
  	  .append("g")
    	.attr("transform", "translate(" + (radius) + "," + (radius) + ")");

var svgDefs = svg.append("svg:defs")  

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.60)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var maxGamesToTopics = 0,
	maxTopicsToGames = 0,
	totalGames = 50;
var gradientCounter = 0;

function setSVG () {
	$('#game-vis').empty();
	svg = {};
	svg = d3.select("#game-vis").append("svg")
    	.attr("width", $('#wrapper').outerWidth())
    	.attr("height", diameter+240)
  	  .append("g")
    	.attr("transform", "translate(" + (radius) + "," + (radius) + ")")

    svgDefs = svg.append("svg:defs");
    map = {
		"name": "",
		"children": []
	};
	gwlinks = [];
	wtlinks = [];
	gtlinks = [];
}

function processGuardianData () {
	Tabletop.init( { key: '0ArF9tD_naD7edHIyOEE3endKbzZmZExTdWVoT0xTTmc', callback: processDataOriginal, simpleSheet: true } );
}
function processDataOriginal(data){
	setSVG();
	var gameRootNode = {
		name: 'games',
		children: []
	}
	var weaponRootNode = {
		name: 'games',
		children: []
	}
	var contentRootNode = {
		name: 'games',
		children: []
	}

	var games = {},
		topics = {},
		gameNodes = [],
		weaponNodes = [],
		topicNodes = []
	

	for(var d = 0; d < totalGames; d++){


		games[ data[d]['name'] ] = {
			name: data[d]['name'],
			className: getClassName(data[d]['name']),
			children: [],
			size: Number(data[d]['sales']),

			numTopics: 0,
			topics: [],
			nodeType: 'game',

			connectedNodes: [],
			gameRating: data[d]['rating'],
			violenceLink: '',
			weaponLink: '',
			ratingLink: data[d]['rating'],
			weaponConnections:{'guns': [], 'noguns': []},
			topicConnections: {'violence': [], 'noviolence': []}
		}
		
		var contentTags = ( data[d]['contentdescripters'] != '' ) ? data[d]['contentdescripters'].split(', '): [];	
		if( contentTags.length > 0){
			var includeGameContent = false
			
			games[ data[d]['name'] ]['numTopics'] = contentTags.length;
			contentTags.forEach(function(t){
				// console.log(t);
				if( !topics[ t ] ){
					topics[t] = {
						name: t,
						className: getClassName(t),
						children: [],
						size: 0,
						numGames: 0,
						games: [],
						nodeType: 'topic',
						connectedNodes: [],
						barLinks: {},
						violenceLink: ''
					}
				}

				gtlinks.push({
					type: 'game-topic-link',
					source: games[ data[d]['name'] ],
					target: topics[t]
				})
				topics[t]['size'] ++;
				topics[t]['numGames'] ++;
				
				topics[t]['connectedNodes'].push(games[ data[d]['name'] ]['className']);
				topics[t]['games'].push(games[ data[d]['name'] ]['name']);
				games[ data[d]['name'] ]['connectedNodes'].push(topics[t]['className']);		
				games[ data[d]['name'] ]['topics'].push(topics[t]['name']);
				
				if(t == 'Intense Violence' || t == 'Blood and Gore' || t == 'Violence' || t == 'Blood' || t == 'Cartoon Violence'  ){
					includeGameContent = true;
					topics[t]['violenceLink'] = topics[t]['barLinks']['violence'] = 'violence'
					games[ data[d]['name'] ]['topicConnections']['violence'].push(topics[t])
				} else {
					topics[t]['violenceLink'] = topics[t]['barLinks']['violence'] = 'noviolence'
					games[ data[d]['name'] ]['topicConnections']['noviolence'].push(topics[t])
				}
				
			})
			
		} else {
			games[ data[d]['name'] ]['violenceLink'] = 'noviolence'
		}
	}

	for(var g in games){
		gameRootNode.children.push(games[g])
		if(games[g]['numTopics'] > maxGamesToTopics){
			maxGamesToTopics = games[g]['numTopics'];
		}		
	}
	for(var t in topics){
		contentRootNode.children.push(topics[t])
		if(topics[t]['numGames'] > maxTopicsToGames){
			maxTopicsToGames = topics[t]['numGames'];
		}
	}
	
	maxGameTopics = maxGamesToTopics
	if( maxTopicsToGames > maxGameTopics){
		maxGameTopics = maxTopicsToGames;
	}
		
	map.children.push(gameRootNode)
	map.children.push(weaponRootNode)
	map.children.push(contentRootNode)
	
	drawChart();
}


var sort_type = {
	GENRE : "Genre",
	THEME : "Theme",
	CONCEPT : "Concept"
};
function processData(data, type){
	setSVG();
	var totalGames = data.length;

	var gameRootNode = {
		name: 'games',
		children: []
	}
	var weaponRootNode = {
		name: 'games',
		children: []
	}
	var contentRootNode = {
		name: 'games',
		children: []
	}

	var games = {},
		topics = {},
		gameNodes = [],
		weaponNodes = [],
		topicNodes = []
	

	for(var d = 0; d < totalGames; d++){

		var contentTags;

		switch (type) {
			case sort_type.GENRE:
				contentTags = data[d].genres;
				break;
			case sort_type.THEME:
				contentTags = data[d].themes;
				break;
			case sort_type.CONCEPT:
				contentTags = data[d].concepts;
				break;
		}
		console.log(contentTags);
		console.log(contentTags.length);

		games[ data[d]['name'] ] = {
			name: data[d]['name'],
			className: getClassName(data[d]['name'].toString()),
			children: [],
			// size: Number(data[d]['sales']),
			size : contentTags.length,
			numTopics: 0,
			topics: [],
			nodeType: 'game',

			connectedNodes: [],
			// gameRating: data[d]['rating'],
			violenceLink: '',
			weaponLink: '',
			// ratingLink: data[d]['rating'],
			// weaponConnections:{'guns': [], 'noguns': []},
			topicConnections: {'violence': [], 'noviolence': []}
		}
		
		
		if( contentTags.length > 0){
			var includeGameContent = false
			
			games[ data[d]['name'] ]['numTopics'] = contentTags.length;
			contentTags.forEach(function(t){
				
				if( !topics[ t.name ] ){
					topics[t.name] = {
						name: t.name,
						className: getClassName(t.name),
						children: [],
						size: 0,
						numGames: 0,
						games: [],
						nodeType: 'topic',
						connectedNodes: [],
						barLinks: {},
						violenceLink: ''
					}
				}

				gtlinks.push({
					type: 'game-topic-link',
					source: games[ data[d]['name'] ],
					target: topics[t.name]
				})
				topics[t.name]['size'] ++;
				topics[t.name]['numGames'] ++;
				
				topics[t.name]['connectedNodes'].push(games[ data[d]['name'] ]['className']);
				topics[t.name]['games'].push(games[ data[d]['name'] ]['name']);
				games[ data[d]['name'] ]['connectedNodes'].push(topics[t.name]['className']);		
				games[ data[d]['name'] ]['topics'].push(topics[t.name]['name']);
				
				if(t.name == 'Intense Violence' || t.name == 'Blood and Gore' || t.name == 'Violence' || t.name == 'Blood' || t.name == 'Cartoon Violence'  ){
					includeGameContent = true;
					topics[t.name]['violenceLink'] = topics[t.name]['barLinks']['violence'] = 'violence'
					games[ data[d]['name'] ]['topicConnections']['violence'].push(topics[t.name])
				} else {
					topics[t.name]['violenceLink'] = topics[t.name]['barLinks']['violence'] = 'noviolence'
					games[ data[d]['name'] ]['topicConnections']['noviolence'].push(topics[t.name])
				}
				
			})
			
		} else {
			games[ data[d]['name'] ]['violenceLink'] = 'noviolence'
		}	
	}

	for(var g in games){
		gameRootNode.children.push(games[g])
		if(games[g]['numTopics'] > maxGamesToTopics){
			maxGamesToTopics = games[g]['numTopics'];
		}		
	}
	for(var t in topics){
		contentRootNode.children.push(topics[t])
		if(topics[t]['numGames'] > maxTopicsToGames){
			maxTopicsToGames = topics[t]['numGames'];
		}
	}
	
	maxGameTopics = maxGamesToTopics
	if( maxTopicsToGames > maxGameTopics){
		maxGameTopics = maxTopicsToGames;
	}
		
	map.children.push(gameRootNode)
	map.children.push(weaponRootNode)
	map.children.push(contentRootNode)
	
	drawChart();
}

function color(val){
	var color;
	if(val == 1){
		color= '#eee'
	} else if (val == 2){
		color = '#ccc'
	} else if (val == 3){
		color = '#333'
	} else if (val == 4){
		color = '#666'
	}
	return color
}


function drawChart(){
	
	var barScale = d3.scale.linear()
	    .domain([0,20])
	    .range([0,50]);

	var nodes = cluster.nodes(map)

	svg.selectAll(".node-dot")
      .data(nodes.filter(function(n) { return n.depth == 2; }))
    .enter().append("g")
      .attr("transform", function(d) {console.log("node checks"); console.log(d);  return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    .append("circle")
	  .attr('class', function(d){
		return 'node-dot ' + 'nodedot-' + d.className 
	})
	  .attr('cy', -5)
      .attr('r', 8)
	  .style('fill', function(d){
		 	return getColor(d.nodeType, d.size)
   	   })
	  .on("mouseover", showConnections)
      .on("mouseout", hideConnections)
	
	svg.selectAll(".node")
      .data(nodes.filter(function(n) { return n.depth == 2; }))
    .enter().append("g")
	  .attr("class", 'node')
      .attr("transform", function(d) { 
	
		var translatevalue = d.y + 5
		if(d.nodeType == 'game'){
			translatevalue += 10
		} else {
			translatevalue += barScale(d.size)
		}
		
	
		return "rotate(" + (d.x - 90) + ")translate(" + translatevalue + ")"; })
    .append("text")
      .attr("dx", function(d) { return d.x < 180 ? 0 : 0; })
      .attr("dy", "5")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.name; })
      .attr("id", function(d){
			return 'nodetext-' + d.className
	   })
	  .attr("class", function(d){
			var bClass ="circle-text"
			
			if(d.nodeType == 'game'){
				bClass += ' btext-' + d.weaponLink + ' btext-' + d.violenceLink + ' btext-' + d.ratingLink
			} else if(d.nodeType == 'weapon'){
				bClass += ' btext-' + d.weaponLink 
			} else {
				bClass += ' btext-' + d.violenceLink 
			}	

			return bClass;
      })
	  .style('fill', function(d){
	  			if(d.nodeType == 'game'){
					return '#394B9F'
				} else if(d.nodeType == 'weapon' ) {
					return '#CC2F27'
				} else if( d.nodeType == 'topic'){
					return '#3C602E'
				}
	
	  	   })
      .on("mouseover", showConnections)
      .on("mouseout", hideConnections)

	$('.node').mousemove(setPopupPosition);
	$('.node-dot').mousemove(setPopupPosition);

	
	gameTopicsColor = d3.interpolateRgb("#ccc", '#3C602E');


	gameTopicsScale = d3.scale.linear()
	    				.domain([0,maxGameTopics])
	    				.range([0,1]);
		
	var mergedLinks = gwlinks.concat(gtlinks)
	
	svg.selectAll(".links")
		.data(bundle(mergedLinks))
	.enter().append("path")
		.attr("class", function(d){
			var linkClass = 'links link-' + d[4]['className'] + ' link-' + d[0]['className']
			var node = (d[4]['nodeType'] == 'game')? d[4] : d[0];
			
			var gLink = (d[4]['nodeType'] == 'game')? d[4] : d[0];
			var oLink = (d[4]['nodeType'] == 'game')? d[0] : d[4];
			
			linkClass += ' barlink-' + gLink['className'] + oLink['className']

			linkClass += ' barlink-' + node['gameRating']
			
		
			
			return linkClass
		})
		.attr("id", function(d){
			return 'link-' + d[4]['className'] + '-' + d[0]['className']
		})
		.attr("d", line)
		.style("stroke", function(d){
			var gradient;
			if(d[4]['nodeType'] == 'topic' && d[0]['nodeType'] == 'game' ){
				return 'url(#' + getGradient(d[4]['numGames'], d[0]['size'], 'topic', 'game') +')'
			} else if(d[4]['nodeType'] == 'weapon' && d[0]['nodeType'] == 'game'){
				return 'url(#' + getGradient(d[4]['numGames'], d[0]['size'], 'weapon', 'game') +')'
			}
			
			return'url(#' + gradient +')'
		});
		


}

function getClassName(title){
// function getClassName(_title){
	// var title = _title.toString();

	var name = title.replace(/ /g,'')
	name = name.replace(/\'/g,'')
	name = name.replace(/\//g,'')
	name = name.replace(/&/g,'')
	name = name.replace(/\./g,'')
	name = name.replace(/-/,'')
	name = name.replace(/!/g,'')
	name = name.replace(/:/g,'').toLowerCase()
	return name;
}

function setPopupPosition(e){
	e = jQuery.event.fix(e);
	mouseX = e.pageX; //- $('#gia-interactive').offset().left
	mouseY = e.pageY;
	mouseY += $('#filter').scrollTop();

	$('.gia-popup').css({
		top: mouseY,
		left: mouseX
	})

}


function showConnections(d) {

	svg.selectAll('.circle-text')
		.classed('circle-text-dim', true);
		
	svg.select('#nodetext-' + d.className)
		.classed('highlight', true)
		.classed('circle-text-dim', false);
	
	svg.selectAll('.node-dot')
		.style("opacity", .01)
	
	svg.selectAll('path.links')
		.style("stroke-opacity", .01)
	
	svg.selectAll('path.link-' + d.className)
		.style("stroke-opacity",1)
		
	svg.selectAll('.nodedot-' + d.className)
		.style("opacity",1)

	d.connectedNodes.forEach(function(n){
		svg.select('#nodetext-' + n)
			.classed('highlight', true)
			.classed('circle-text-dim', false);
			
		svg.selectAll('.nodedot-' + n)
			.style("opacity", 1)	
	})
	
	$("#node-info").empty()

	if(d.nodeType == 'game'){
		$("#gameTemplate").tmpl( {
			name: d.name,
			sales: roundSales(d.size),
			rating: getRating(d.gameRating),
			color: getColor(d.nodeType, d.size),
			topicCount: d.topics.length		
		}).appendTo( "#node-info" );		
		var topics = (d.topics.length > 0)? d.topics: ['none'];
		$.each(topics, function(i, t){
			$("#listTemplate").tmpl( {item: t}).appendTo( "#node-topic-references .node-data" );
		})
	} else if( d.nodeType == 'topic'){
		console.log("NODE TYPE");
		console.log(d);
		$("#weaponTopicTemplate").tmpl( {
			name: (d.name.toLowerCase().search('use') >= 0)? 'the ' + d.name.toLowerCase() : d.name.toLowerCase(),
			color: getColor(d.nodeType, d.size),
			count: (d.numGames > 1) ? addCommas(d.numGames)	+ ' games have': addCommas(d.numGames)	+ ' game has' 	
		}).appendTo( "#node-info" );		
	}
	$("#node-info").show()
	
}


function getRating(rating){
		var text = 'none'
		if(rating == 'e'){
			text = 'E (everyone)'
		} else if(rating == 'e10'){
			text = 'E10 (ages 10+)'
		} else if(rating == 't'){
			text = 'T (ages 13+)'
		} else if(rating == 'm'){
			text = 'M (ages 17+)'
		}
		return text;
}

function hideConnections(d) {
	$("#node-info").hide()
	svg.selectAll('path.links')
		.style("stroke-opacity", 1);
		
	svg.selectAll('.circle-text')
		.classed('circle-text-dim', false)
		.classed('highlight', false);
		
	svg.selectAll('.node-dot')
		.style("opacity", 1)		
}


function getGradient(startValue, endValue, topic1, topic2){

	var gradientId = "gradient" + gradientCounter;

	var gradient = svgDefs.append("svg:linearGradient")
		.attr("id", gradientId)
	
	gradient.append("svg:stop")
	    .attr("offset", "10%")
	    .attr("stop-color", getColor( topic1,startValue))

	gradient.append("svg:stop")
	    .attr("offset", "90%")
	    .attr("stop-color", getColor(topic2, endValue))

	gradientCounter++;
	return gradientId;
}


function getColor(topic, value){
	var color = '#ccc'
	if(topic == 'game'){	
		if( value <= 1){
			color = '#D7DEF7'
		} else if( value > 1 && value <= 5){
			color = '#8B9BD9'
		} else if( value > 5 && value <= 10){
			color = '#5265AE'
		} else if( value > 10 && value <= 15){
			color = '#394B9F'
		} else if( value > 15 ){
			color = '#2C3878'
		}	
	}else if(topic == 'weapon'){

		if( value <= 1){
			color = '#FFE2DB'
		} else if( value > 1 && value <= 5){
			color = '#E88B78'
		} else if( value > 5 && value <= 10){
			color = '#CC2F27'
		} else if( value > 10 && value <= 15){
			color = '#871D1B'
		} else if( value > 15 ){
			color = '#5E0202'
		}
	}else if(topic == 'topic'){
		
		if( value <= 1){
			color = '#CEDBB4'
		} else if( value > 1 && value <= 5){
			color = '#9DB270'
		} else if( value > 5 && value <= 10){
			color = '#5E843A'
		} else if( value > 10 && value <= 15){
			color = '#3C602E'
		} else if( value > 15 ){
			color = '#1E3B13'
		}
	}
	return color;	
}

function roundSales (n){
	var newN = n/100000;
	newN = Math.round(newN)/10
	
	
	return newN.toFixed(1) + ' m';
}



function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}