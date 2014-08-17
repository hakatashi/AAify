var uglifyjs = require('uglify-js');
var Caman = require('caman').Caman;

var tokenizer = uglifyjs.tokenizer('var aa = require("aa")');

Caman('circle.png', function () {
	var perSide = 50;

	this.resize({
		width: perSide * 2,
		height: perSide
	});

	this.render(function () {
		var size = this.pixelData.length / 4;

		for (var i = 0; i < size; i++) {
			if (this.pixelData[i * 4] < 128) {
				process.stdout.write('*');
			} else {
				process.stdout.write(' ');
			}

			if ((i + 1) % (perSide * 2) == 0) {
				process.stdout.write('\n');
			}
		}
	});
});
