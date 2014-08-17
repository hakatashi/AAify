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
		if (previousToken.match(separateLast) && tokenString.match(separateFirst)) {
			tokens.push(' ');
			minifiedSource += ' ';
			tokenAreaSize += 1;
		}
	}

	tokens.push(tokenString);
	tokenAreaSize += tokenString.length;
	minifiedSource += tokenString;
}

Caman('rabbit.png', function () {
	var perSide = 50;

	// count black area size
	var dataSize = this.pixelData.length / 4;
	var blackAreaSize = 0;
	for (var i = 0; i < dataSize; i++) {
		if (this.pixelData[i * 4] < 128) blackAreaSize++;
	}

	this.resize({
		width: perSide * 2,
		height: perSide
	});

	this.render(function () {
		var size = this.pixelData.length / 4;

		for (var i = 0; i < size; i++) {
			if (this.pixelData[i * 4] < 50) {
				process.stdout.write('*');
			} else if (this.pixelData[i * 4] < 200) {
				process.stdout.write('-');
			} else {
				process.stdout.write(' ');
			}

			if ((i + 1) % (perSide * 2) == 0) {
				process.stdout.write('\n');
			}
		}
	});
});
