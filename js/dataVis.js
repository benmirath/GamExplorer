//Modified from the guardian article found at this url:
//http://www.theguardian.com/world/interactive/2013/apr/30/violence-guns-best-selling-video-games

var app = app || {};
app.dataVisObject = function () {
	this.target = "#id",
	this.cluster = {},
	this.svg = {},
	this.svgDefs = {},
	this.bundle = {},

	this.data = {},
	this.map = {
		"name" : "",
		"children" : []
	},
	this.gtlinks = [],
	this.resetMap = function () {
		this.map = {
			 "name": "",
			 "children": []
		};
		this.gtlinks = [];
	},
	this.init = function () {
		this.resetMap();
		$(this.target).empty();
		this.cluster = d3.layout.cluster()
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
		
		this.bundle = d3.layout.bundle();

		this.svg = d3.select(this.target).append("svg")
	    	.attr("viewBox", "0 0 999 980")
	    	.attr("preserveAspectRatio", "xMidYMid meet")
	  	  .append("g")
	    	.attr("transform", "translate(" + (radius) + "," + (radius) + ")");

	   	this.svgDefs = this.svg.append("svg:defs");
	},
	this.setData = function (_data) {
		data = _data;
	}
}

//General data vis settings
var diameter = 640,
    radius = 940 / 2,
    innerRadius = radius - 270,
	circlew = 940;

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.60)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var maxGamesToTopics = 0,
	maxTopicsToGames = 0,
	totalGames = 50;
var gradientCounter = 0;

var sort_type = {
	GENRE : "Genre",
	THEME : "Theme",
	CONCEPT : "Concept"
};

function processData(_dataObj, _data, _type){
	_dataObj.init();
	console.log("log1");
	var totalGames = _data.length;
	var gameRootNode = {
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
		topicNodes = []

	console.log(_type);
	console.log(sort_type.GENRE);
	console.log(sort_type.THEME);

	for(var d = 0; d < totalGames; d++){
		var contentTags;
		switch (_type) {
			default:
			case "Genre":
				console.log("genre");
				contentTags = _data[d].genres || [];
				break;
			case "Themes":
				console.log("theme");
				contentTags = _data[d].themes || [];
				break;
			case "Concepts":
				console.log("concept");
				contentTags = _data[d].concepts || [];
				break;
		}

		games[ _data[d]['name'] ] = {
			name: _data[d]['name'],
			className: getClassName(_data[d]['name'].toString()),
			children: [],
			size : contentTags.length,
			numTopics: 0,
			topics: [],
			nodeType: 'game',

			connectedNodes: [],
			violenceLink: '',
			weaponLink: '',
			topicConnections: {'violence': [], 'noviolence': []},
			svg:_dataObj.svg
		}		
		
		if( contentTags.length > 0){
			var includeGameContent = false
			
			games[ _data[d]['name'] ]['numTopics'] = contentTags.length;
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
						violenceLink: '',
						svg:_dataObj.svg
					}
				}

				_dataObj.gtlinks.push({
					type: 'game-topic-link',
					source: games[ _data[d]['name'] ],
					target: topics[t.name]
				})
				topics[t.name]['size'] ++;
				topics[t.name]['numGames'] ++;
				
				topics[t.name]['connectedNodes'].push(games[ _data[d]['name'] ]['className']);
				topics[t.name]['games'].push(games[ _data[d]['name'] ]['name']);
				games[ _data[d]['name'] ]['connectedNodes'].push(topics[t.name]['className']);		
				games[ _data[d]['name'] ]['topics'].push(topics[t.name]['name']);
				
				if(t.name == 'Intense Violence' || t.name == 'Blood and Gore' || t.name == 'Violence' || t.name == 'Blood' || t.name == 'Cartoon Violence'  ){
					includeGameContent = true;
					topics[t.name]['violenceLink'] = topics[t.name]['barLinks']['violence'] = 'violence'
					games[ _data[d]['name'] ]['topicConnections']['violence'].push(topics[t.name])
				} else {
					topics[t.name]['violenceLink'] = topics[t.name]['barLinks']['violence'] = 'noviolence'
					games[ _data[d]['name'] ]['topicConnections']['noviolence'].push(topics[t.name])
				}
				
			})
			
		} else {
			games[ _data[d]['name'] ]['violenceLink'] = 'noviolence'
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
		
	_dataObj.map.children.push(gameRootNode)
	_dataObj.map.children.push(contentRootNode)
	
	drawChart(_dataObj);
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


function drawChart(_dataObj){
	var barScale = d3.scale.linear()
	    .domain([0,20])
	    .range([0,50]);

	var nodes = _dataObj.cluster.nodes(_dataObj.map)

	_dataObj.svg.selectAll(".node-dot")
      .data(nodes.filter(function(n) { return n.depth == 2; }))
    .enter().append("g")
      .attr("transform", function(d) {
      	return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; 
      })
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
	
	_dataObj.svg.selectAll(".node")
      .data(nodes.filter(function(n) { return n.depth == 2; }))
    .enter().append("g")
	  .attr("class", 'node')
      .attr("transform", function(d) { 
		var translatevalue = d.y + 15
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
					return '#FF6350'
				}
	
	  	   })
      .on("mouseover", showConnections)
      .on("mouseout", hideConnections)
    

    _dataObj.svg.selectAll(".node text")
      .call(wrap, textWidth);

	$('.node').mousemove(setPopupPosition);
	$('.node-dot').mousemove(setPopupPosition);

	
	gameTopicsColor = d3.interpolateRgb("#FF6350", '#CC2135');


	gameTopicsScale = d3.scale.linear()
	    				.domain([0,maxGameTopics])
	    				.range([0,1]);
	
	_dataObj.svg.selectAll(".links")
		.data(_dataObj.bundle(_dataObj.gtlinks))
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
				return 'url(#' + getGradient(_dataObj, d[4]['numGames'], d[0]['size'], 'topic', 'game') +')'
			} else if(d[4]['nodeType'] == 'weapon' && d[0]['nodeType'] == 'game'){
				return 'url(#' + getGradient(_dataObj, d[4]['numGames'], d[0]['size'], 'weapon', 'game') +')'
			}
			
			return'url(#' + gradient +')'
		});
}

function getClassName(title){
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
 	var xOffset = $('#filter').width() - $('#wrapper').width();
 	mouseX -= (xOffset / 2) - 20;
    mouseY += $('#filter').scrollTop();


	$('.gia-popup').css({
		top: mouseY,
		left: mouseX
	})

}


function showConnections(d) {
	d.svg.selectAll('.circle-text')
		.classed('circle-text-dim', true);
		
	d.svg.select('#nodetext-' + d.className)
		.classed('highlight', true)
		.classed('circle-text-dim', false);
	
	d.svg.selectAll('.node-dot')
		.style("opacity", .01)
	
	d.svg.selectAll('path.links')
		.style("stroke-opacity", .01)
	
	d.svg.selectAll('path.link-' + d.className)
		.style("stroke-opacity",1)
		
	d.svg.selectAll('.nodedot-' + d.className)
		.style("opacity",1)

	d.connectedNodes.forEach(function(n){
		d.svg.select('#nodetext-' + n)
			.classed('highlight', true)
			.classed('circle-text-dim', false);
			
		d.svg.selectAll('.nodedot-' + n)
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
	d.svg.selectAll('path.links')
		.style("stroke-opacity", 1);
		
	d.svg.selectAll('.circle-text')
		.classed('circle-text-dim', false)
		.classed('highlight', false);
		
	d.svg.selectAll('.node-dot')
		.style("opacity", 1)		
}


function getGradient(_dataObj, startValue, endValue, topic1, topic2){
	var gradientId = "gradient" + gradientCounter;
	var gradient = _dataObj.svgDefs.append("svg:linearGradient")
		.attr("id", gradientId)
	
	gradient.append("svg:stop")
	    .attr("offset", "10%")
	    .attr("stop-color", getColor( topic1, startValue))

	gradient.append("svg:stop")
	    .attr("offset", "90%")
	    .attr("stop-color", getColor( topic2, endValue))

	gradientCounter++;
	return gradientId;
}

function getColor(topic, value){
	var color = '#ccc'
	if (topic == 'game') {
		if( value <= 1){
			color = '#2195CC'
		} else if( value > 1 && value <= 5){
			color = '#1D82B2'
		} else if( value > 5 && value <= 10){
			color = '#17668C'
		}
	} else if (topic == 'topic') {
		
		if( value <= 1){
			color = '#FF6350'
		} else if( value > 1 && value <= 5){
			color = '#FF2942'
		} else if( value > 5 && value <= 10){
			color = '#CC2135'
		}
	}
	return color;
}

function roundSales (n) {
	var newN = n/100000;
	newN = Math.round(newN)/10
	
	return newN.toFixed(1) + ' m';
}

function addCommas(nStr) {
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

var textWidth = 220;
function wrap(text, width) {
	console.log("boop");
	console.log(text);
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", 0);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + "em").text(word);
      }
    }
  });
}