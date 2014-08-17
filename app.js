var uglifyjs = require('uglify-js');
var Caman = require('caman').Caman;
var fs = require('fs');

var separateLast = new RegExp('[A-Za-z0-9$_]$');
var separateFirst = new RegExp('^[A-Za-z0-9$_]');

if (process.argv.length < 3) {
	console.log('Too few arguments');
	process.exit();
}

var tokenizer = uglifyjs.tokenizer(fs.readFileSync(process.argv[2]).toString());

var token;
var tokens = [];
var tokenAreaSize = 0;
var minifiedSource = '';
while ((token = tokenizer()).value !== undefined) {
	var tokenString;

	if (token.type === 'string') {
		tokenString = "'" + token.value + "'";
	} else {
		tokenString = token.value.toString();
	}

	var previousToken = tokens.slice(-1)[0];
	if (previousToken !== undefined) {
		if (previousToken.match(separateLast)
		    && tokenString.match(separateFirst)) {
			tokens.push(' ');
			tokenAreaSize += 1;
		}
	}

	tokens.push(tokenString);
	tokenAreaSize += tokenString.length;
}

Caman('rabbit.png', function () {
	// count black area size
	var dataSize = this.pixelData.length / 4;
	var blackAreaSize = 0;
	for (var i = 0; i < dataSize; i++) {
		if (this.pixelData[i * 4] < 128) blackAreaSize++;
	}

	var resizeRatio = Math.sqrt((tokenAreaSize / 2) / blackAreaSize);
	var width = Math.floor(this.width * resizeRatio * 2);
	var height = Math.floor(this.height * resizeRatio);

	this.resize({
		width: width,
		height: height
	});

	this.render(function () {
		var size = this.pixelData.length / 4;
		var blackSizes = [];
		var blackSizeBuf = 0;

		for (var i = 0; i < size; i++) {
			if (this.pixelData[i * 4] < 128) {
				blackSizeBuf++;
			} else {
				if (blackSizeBuf !== 0) {
					blackSizes.push(blackSizeBuf);
					blackSizeBuf = 0;
				}
			}
		}

		var currentDP = [0];
		var currentRoutes = [[0]];

		for (var i = 0; i < tokens.length; i++) {
			currentDP[i + 1] = currentDP[i] + tokens[i].length;
			currentRoutes[i + 1] = [i + 1];
		}

		for (var i = 0; i < blackSizes.length; i++) {
			var previousDP = currentDP;
			currentDP = [];

			var previousRoutes = currentRoutes;
			currentRoutes = [];

			for (var j = 0; j < tokens.length + 1; j++) {
				var additionalLosses = blackSizes[i];
				var minimumLosses = previousDP[j] + additionalLosses;
				var minimumRoutes = previousRoutes[j].concat(0);

				for (var k = 1; k <= j; k++) {
					additionalLosses -= tokens[j - k].length;

					if (minimumLosses > previousDP[j - k]
					                    + Math.abs(additionalLosses)) {
						minimumLosses = previousDP[j - k]
						                + Math.abs(additionalLosses);
						minimumRoutes = previousRoutes[j - k].concat(k);
					}
				}

				currentDP[j] = minimumLosses;
				currentRoutes[j] = minimumRoutes;
			}
		}

		console.log(tokens.length);
		console.log(currentDP[tokens.length]);
		console.log(currentRoutes[tokens.length]);
	});
});
