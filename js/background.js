var images = [
	"hyper_light_drifter.gif",
	"journey.gif",
	"metal_gear_rising.gif",
	"pacman.gif",
	"pong.gif",
	"zelda_link_to_the_past.gif"
];
cachedImage = 0;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function backgroundInit () {
	var bg = $('body');

	// This should be a variable outside the function that you increment. \
	//Every time it gets to the full length of the array of iamge uri's, 
	//loop it back to 0
	var select = getRandomInt(0, images.length);

	if (select === cachedImage) return backgroundInit();
	else {
		bg.css('background-image', 'url(images/bg_images/' + images[select] + ')');
		cachedImage = select;
		setTimeout(backgroundInit, 5000);
	}
}