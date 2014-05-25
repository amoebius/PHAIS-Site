
visualizer = {

	size: null,
	boardSize: null,
	spacing: null,
	epsilon: 0.0000001,
	names: [null, null],
	colors: [null, null],
	moveCount: [null, null],
	moves: null,
	numMoves: null,
	moveIndex: null,
	moveTypes: {
		starts:  'starts',
		RGB:     'RGB',
		move:    'moved',
		block:   'blocked',
		win:     'wins',
		invalid: 'Invalid:',
		error:   'Error:',
	},
	directions: {
		up:    [ 0, -1],
		down:  [ 0,  1],
		left:  [-1,  0],
		right: [ 1,  0],
	},
	winner: null,
	displayingWinner: null,

	defaultColors: [[0xFF, 0x44, 0x99], [0x44, 0xEE, 0x99]],
	backgroundImage: null,
	trailColor: [0x55, 0x00, 0x55],
	trailAlpha: 0.1,
	loc: [null, null],
	canvas: null,
	board: null,
	trail: null,
	textStyle: null,
	blockInvalidated: null,
	invalidatedBlocks: null,

	run: function(canvas, log, size, callback) {
		
		this.canvas = canvas;
		this.canvas.width = size;
		this.canvas.height = size;

		this.parseLog(log);

		this.board = []
		for (var y = 0; y < this.boardSize; ++y) {
			this.board.push([]);
			for (var x = 0; x < this.boardSize; ++x) {
				this.board[y].push(false);
			}
		}

		this.trail = []
		for (var y = 0; y < this.boardSize; ++y) {
			this.trail.push([]);
			for (var x = 0; x < this.boardSize; ++x) {
				this.trail[y].push([]);
			}
		}

		this.blockInvalidated = [];
		for (var y = 0; y < this.boardSize; ++y) {
			this.blockInvalidated.push([]);
			for (var x = 0; x < this.boardSize; ++x) {
				this.blockInvalidated[y].push(false);
			}
		}
		this.invalidatedBlocks = [];

		for (var player = 0; player < 2; ++player) {
			this.addTrail(player);
		}

		this.backgroundImage = document.createElement("canvas");
		
		WebFont.load({
			custom: {
				families: ["Six Caps"],
				urls: ["/static/css/fonts/sixcaps.css"],
			},

			active: $.proxy(function() {
				this.resize(size);
				callback();
			}, this),
		});

	},

	redrawBackground: function() {
		this.backgroundImage.width = this.size;
		this.backgroundImage.height = this.size;
		var bg_context = this.backgroundImage.getContext("2d");

		grd = bg_context.createLinearGradient(0.000, 78.000, this.size, this.size);
		grd.addColorStop(0, 'rgba(20, 32, 40, 1.000)');
		grd.addColorStop(1, 'rgba(25, 12, 32, 1.000)');
		bg_context.fillStyle = grd;

		bg_context.fillRect(0, 0, this.size, this.size);
		this.drawText(bg_context);
	},

	resize: function(size) {
		this.size = size;
		this.canvas.width = this.size;
		this.canvas.height = this.size;
		this.spacing = this.size * 1.0 / this.boardSize + this.epsilon;
		this.fontStyle = (this.size / 4.5).toString() + "px 'Six Caps'";
		this.redrawBackground();
		this.invalidate();
		this.redraw();
	},

	drawText: function(context, winner) {
		context.strokeStyle = "rgb(60,60,100)";
		context.font = this.fontStyle;
		context.lineWidth = 1;
		context.lineJoin = "miter";
		context.miterLimit = 2;
		const translucency = 0.9;
		const winTranslucency = 0.1;
		const winBrightness = 0.4;
		const xFactor = 0.07;
		const yFactor = 0.11;
		const yComp = 0.04;

		if(winner == 1 || winner == 0) {
			context.strokeStyle = "#110555";
			context.lineWidth = 1.5;
		}

		if(winner != 1) {
			context.textBaseline = "hanging";
			context.textAlign = "left";
			if(winner == 0) {
				context.fillStyle = this.colorToStyle(this.interpolateColor(this.colors[0], [255, 255, 255], winBrightness).concat(1 - winTranslucency));
			} else {
				context.fillStyle = this.colorToStyle(this.colors[0].concat(1 - translucency));
			}
			context.fillText(this.names[0], this.size * xFactor, this.size * yFactor);
			context.strokeText(this.names[0], this.size * xFactor, this.size * yFactor);
		}

		if(winner == 0) {
			context.textBaseline = "middle";
			context.textAlign = "center";
			context.fillText("is victorious", this.size * 0.5, this.size * 0.5);
			context.strokeText("is victorious", this.size * 0.5, this.size * 0.5);
			return;
		}

		context.textBaseline = "alphabetic";
		context.textAlign = "right";
		if(winner == 1) {
			context.fillStyle = this.colorToStyle(this.interpolateColor(this.colors[1], [255, 255, 255], winBrightness).concat(1 - winTranslucency));
		} else {
			context.fillStyle = this.colorToStyle(this.colors[1].concat(1 - translucency));
		}
		context.fillText(this.names[1], this.size * (1 - xFactor), this.size * (1 - yFactor - yComp));
		context.strokeText(this.names[1], this.size * (1 - xFactor), this.size * (1 - yFactor - yComp));

		if(winner == 1) {
			context.textBaseline = "middle";
			context.textAlign = "center";
			context.fillText("Victory to", this.size * 0.5, this.size * 0.5);
			context.strokeText("Victory to", this.size * 0.5, this.size * 0.5);
			return;
		}

		context.textBaseline = "middle";
		context.textAlign = "center";
		context.fillStyle = this.colorToStyle(this.interpolateColor(this.colors[0], this.colors[1], 0.5).concat(1 - translucency));
		context.fillText("versus", this.size * 0.5, this.size * 0.5);
		context.strokeText("versus", this.size * 0.5, this.size * 0.5);


		context.beginPath();

	},

	drawPlayer: function(context, location, color) {
		context.fillStyle = this.colorToStyle(color);
		context.strokeStyle = "#FFEEFF";
		context.lineWidth = 0.7;
		context.beginPath();
		context.arc(location[0] * this.spacing + this.spacing / 2, location[1] * this.spacing + this.spacing / 2, this.spacing / 2.6, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	},

	drawBlock: function(context, location, player) {

		context.save();
		context.beginPath();
		var block_x = location[0] * this.spacing;
		var block_y = location[1] * this.spacing;
		var block_size = this.spacing;
		context.rect(block_x, block_y, block_size, block_size);
		context.clip();
		
		context.drawImage(this.backgroundImage, block_x, block_y, block_size, block_size, block_x, block_y, block_size, block_size);

		context.beginPath();
		context.rect(block_x, block_y, block_size, block_size);

		var trail = this.trail[location[1]][location[0]];
		for (var i = 0; i < trail.length; ++i) {
			context.fillStyle = this.colorToStyle(this.interpolateColor(this.colors[trail[i][0]], this.trailColor, trail[i][1])
												  .concat(this.trailAlpha * Math.pow((i + 1) / trail.length, 0.5)));
			context.fill();
		}
		
		context.strokeStyle = "#050510";
		context.lineWidth = 2.5;
		context.lineJoin = "miter";
		context.stroke();
	
		if(this.board[location[1]][location[0]]) {
			const scale = 0.95;
			context.strokeStyle = "#201144";
			context.lineWidth = 2;
			context.fillStyle = "#9977B0";
			context.beginPath();
			context.rect(block_x + this.spacing * (1 - scale) * 0.5, block_y + this.spacing * (1 - scale) * 0.5, block_size * scale, block_size * scale);
			context.fill();
			context.stroke();
		}

		if (this.arrayEqual(location, this.loc[0]) && this.arrayEqual(location, this.loc[1])) {
			for (var player = 0; player < 2; ++player) {
				this.drawPlayer(context, this.loc[player], this.colors[player].concat(0.3));
			}
		} else {
			for (var player = 0; player < 2; ++player) {
				if (this.arrayEqual(location, this.loc[player])) {
					this.drawPlayer(context, this.loc[player], this.colors[player]);
				}
			}
		}

		context.restore();

		this.blockInvalidated[location[1]][location[0]] = false;

	},

	addTrail: function(player) {
		this.trail[this.loc[player][1]][this.loc[player][0]].push([player, this.getTrailBlend(this.moveCount[player])]);
	},

	removeTrail: function(player) {
		this.trail[this.loc[player][1]][this.loc[player][0]].pop();
	},

	getContext: function() {
		return this.canvas.getContext("2d");
	},

	interpolateColor: function(color1, color2, weight) {
		return [Math.floor(color1[0] * (1 - weight) + color2[0] * weight),
				Math.floor(color1[1] * (1 - weight) + color2[1] * weight),
				Math.floor(color1[2] * (1 - weight) + color2[2] * weight)];
	},

	arrayEqual: function(a, b) {
		if (a.length != b.length) return false;
		for (var i = 0; i < a.length; ++i) {
			if (a[i] != b[i]) return false;
		}
		return true;
	},

	arrayAdd: function(a, b) {
		var result = [];
		for (var i = 0; i < a.length; ++i) {
			result.push(a[i] + b[i]);
		}
		return result;
	},

	arraySub: function(a, b) {
		var result = [];
		for (var i = 0; i < a.length; ++i) {
			result.push(a[i] - b[i]);
		}
		return result;
	},

	colorToStyle: function(color) {
		if (color.length == 3) {
			return '#' + (0x1000000 + color[0]*0x10000 + color[1]*0x100 + color[2]).toString(16).substring(1);
		} else {
			return "rgba(" + color[0].toString() + ", " + color[1].toString() + ", " + color[2].toString() + ", " + color[3].toString() + ")";
		}
	},

	getTrailBlend: function(moves) {
		const mean = 0.65;
		const amp = 0.05;
		const period = 20;
		return mean + amp * Math.sin(moves * 2 * Math.PI / period);
	},

	parseLog: function(log) {
		
		var lines = log.split('\n');
		
		var tokenize = function(line) {
			return line.split(' ').reverse();
		};

		var getMessage = function(begin, line) {
			return line.substr(line.indexOf(begin) + begin.length + 1);
		};

		var next = function(tokens) {
			return tokens.pop();
		};

		var nextInt = function(tokens) {
			return parseInt(next(tokens));
		};

		// Initial names should there be errors before the names were read from the bots:
		this.names[0] = "Bot0";
		this.names[1] = "Bot1";

		var line, tokens;
		var oldLoc = [null, null];
		this.moves = [];
		this.moveIndex = 0;
		this.displayingWinner = false;

		for (var i = 0; i < lines.length; ++i) {
			
			var line = lines[i];
			var tokens = tokenize(line);

			var playerID = nextInt(tokens);

			if (playerID == -1) {
				// Opening line: -1 <name> versus <name> size <size>
				this.names[0] = next(tokens);
				next(tokens);
				this.names[1] = next(tokens);
				next(tokens);
				this.boardSize = nextInt(tokens);

			} else {
				
				var type = next(tokens);
				
				if (type == this.moveTypes.starts) {
					// <id> starts at <x> <y>
					next(tokens);
					var x = nextInt(tokens);
					var y = nextInt(tokens);
					this.loc[playerID] = oldLoc[playerID] = [x, y];

				} else if (type == this.moveTypes.RGB) {
					// <id> RGB <red> <green> <blue>
					const weight = 0.25;
					var r = nextInt(tokens);
					var g = nextInt(tokens);
					var b = nextInt(tokens);
					this.colors[playerID] = this.interpolateColor([r, g, b], this.defaultColors[playerID], weight);

				} else if (type == this.moveTypes.move) {
					// <id> moved <direction> to <x> <y>
					var direction = next(tokens);
					this.moves.push([playerID, this.moveTypes.move, direction]);

				} else if (type == this.moveTypes.block) {
					// <id> blocked <x> <y>
					var x = nextInt(tokens);
					var y = nextInt(tokens);
					this.moves.push([playerID, this.moveTypes.block, [x, y]]);

				} else if (type == this.moveTypes.win) {
					// <id> wins
					this.moves.push([playerID, this.moveTypes.win]);

				} else if (type == this.moveTypes.invalid) {
					// <id> Invalid: <message>
					var message = getMessage(playerID, this.moveTypes.invalid, line);
					this.moves.push([this.moveTypes.invalid, message]);

				} else if (type == this.moveTypes.error) {
					// <id> Error: <message>
					var message = getMessage(playerID, this.moveTypes.error, line);
					this.moves.push([this.moveTypes.error, message]);

				}

			}

		}

		this.numMoves = this.moves.length;

	},

	invalidate: function() {
		for(var y = 0; y < this.boardSize; ++y) {
			for(var x = 0; x < this.boardSize; ++x) {
				this.invalidateBlock([x, y]);
			}
		}
		this.displayingWinner = false;
	},

	invalidateBlock: function(block) {
		if (!this.blockInvalidated[block[1]][block[0]]) {
			this.invalidatedBlocks.push(block);
			this.blockInvalidated[block[1]][block[0]] = true;
		}
	},

	redraw: function() {

		var context = this.getContext();

		if (this.winner == null && this.displayingWinner) {
			this.displayingWinner = false;
			this.invalidate();
		}

		while (this.invalidatedBlocks.length) {
			this.drawBlock(context, this.invalidatedBlocks.pop());
		}

		if (this.winner != null && !this.displayingWinner) {
			this.displayingWinner = true;
			context.fillStyle = "rgba(5, 0, 20, 0.6)";
			context.fillRect(0, 0, this.size, this.size);
			this.drawText(context, this.winner);
		}

	},

	setWinner: function(player) {
		this.winner = player;
	},

	unsetWinner: function() {
		this.winner = null;
	},

	stepForward: function() {
		
		var move = this.moves[this.moveIndex];
		this.moveIndex++;

		var playerID = move[0];
		var type = move[1];

		if (type == this.moveTypes.move) {
			var oldLoc = this.loc[playerID];
			var direction = move[2];
			var newLoc = this.arrayAdd(oldLoc, this.directions[direction]);
			this.moveCount[playerID]++;
			this.loc[playerID] = newLoc;
			this.addTrail(playerID);
			this.invalidateBlock(oldLoc);
			this.invalidateBlock(newLoc);

		} else if (type == this.moveTypes.block) {
			var loc = move[2];
			this.board[loc[1]][loc[0]] = true;
			this.invalidateBlock(loc);

		} else if (type == this.moveTypes.win) {
			this.setWinner(playerID);

		} else if (type == this.moveTypes.invalid || type == this.moveTypes.error) {

			// TODO.

		} else {
			console.log("Unexpected move encountered: " + move.toString());
		}

	},

	stepBackward: function() {

		this.moveIndex--;
		var move = this.moves[this.moveIndex];
		
		var playerID = move[0];
		var type = move[1];

		if (type == this.moveTypes.move) {
			var oldLoc = this.loc[playerID];
			var direction = move[2];
			var newLoc = this.arraySub(oldLoc, this.directions[direction]);
			this.moveCount[playerID]--;
			this.removeTrail(playerID);
			this.loc[playerID] = newLoc;
			this.invalidateBlock(oldLoc);
			this.invalidateBlock(newLoc);

		} else if (type == this.moveTypes.block) {
			var loc = move[2];
			this.board[loc[1]][loc[0]] = false;
			this.invalidateBlock(loc);

		} else if (type == this.moveTypes.win) {
			this.unsetWinner();

		} else if (type == this.moveTypes.invalid || type == this.moveTypes.error) {

			// TODO.

		} else {
			console.log("Unexpected move encountered: " + move.toString());
		}

	},

	moveForward: function() {
		this.stepForward();
		this.redraw();
	},

	moveBackward: function() {
		this.stepBackward();
		this.redraw();
	},

	seek: function(move) {

		while (this.moveIndex > move) {
			this.stepBackward();
		}

		while (this.moveIndex < move) {
			this.stepForward();
		}

		this.redraw();

	},

}