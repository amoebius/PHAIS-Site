
visualizer = {

	size: null,
	boardSize: null,
	spacing: null,
	epsilon: 0.0000001,
	names: [null, null],
	colors: [null, null],
	moves: [null, null],
	defaultColors: [[0xFF, 0x44, 0x99], [0x44, 0xEE, 0x99]],
	backgroundColor: [0x20, 0x30, 0x40],
	backgroundImage: null,
	trailColor: [0xAA, 0x00, 0xAA],
	trailAlpha: 0.2,
	loc: [null, null],
	canvas: null,
	board: null,
	trail: null,
	tokens: null,
	timerId: null,
	textStyle: null,

	run: function(canvas, log, size, frequency) {
		this.tokens = log.split(' ').reverse();
		
		this.names[0] = this.next();
		this.next() // versus
		this.names[1] = this.next();
		this.next() // size
		this.boardSize = this.nextInt();
		
		for (var player = 0; player < 2; ++player) {
			// {player} starts at
			for (var i = 0; i < 3; ++i) this.next();
			var x = this.nextInt();
			var y = this.nextInt();
			this.loc[player] = [x, y];
			this.moves[player] = 0;
		}

		for (var player = 0; player < 2; ++player) {
			// {player} color R G B
			for (var i = 0; i < 2; ++i) this.next();

			const weight = 0.25;
			var r = this.nextInt();
			var g = this.nextInt();
			var b = this.nextInt();
			this.colors[player] = this.interpolateColor([r, g, b], this.defaultColors[player], weight);
		}

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
		for (var player = 0; player < 2; ++player) {
			this.trail[this.loc[player][1]][this.loc[player][0]].push([player, this.getTrailBlend(0)]);
		}

		this.canvas = canvas;
		this.resize(size);


		this.timeout = 1000.0 / frequency;
		

		// TODO:  THERE HAS TO BE A BETTER WAY >:C
		setTimeout($.proxy(function() {
			
			this.backgroundImage = document.createElement("canvas");
			this.backgroundImage.width = this.size;
			this.backgroundImage.height = this.size;
			var bg_context = this.backgroundImage.getContext("2d");
			bg_context.fillStyle = this.colorToStyle(this.backgroundColor);
			bg_context.fillRect(0, 0, this.size, this.size);
			this.drawText(bg_context);

			this.draw();
			setTimeout($.proxy(this.move, this), this.timeout);

		}, this), 700);


	},

	next : function() {
		return this.tokens.pop();
	},

	nextInt : function() {
		return parseInt(this.next());
	},

	resize: function(size) {
		this.size = size;
		this.canvas.width = this.size;
		this.canvas.height = this.size;
		this.spacing = this.size * 1.0 / this.boardSize + this.epsilon;
		this.textStyle = (this.size / 5).toString() + "px bold sans-serif 'Six Caps'";
	},

	draw: function() {
		var context = this.getContext();
		for(var y = 0; y < this.boardSize; ++y) {
			for(var x = 0; x < this.boardSize; ++x) {
				this.drawBlock(context, [x, y]);
			}
		}
	},

	drawText: function(context, winner) {
		context.font = this.textStyle;
		context.strokeStyle = "#555599";
		context.lineWidth = 1;
		const translucency = 0.82;
		const winTranslucency = 0.1;
		const winBrightness = 0.3;
		const xFactor = 0.1;
		const yFactor = 0.15;
		const yComp = 0.04;

		if(winner == 1 || winner == 0) {
			context.strokeStyle = "#110555";
			context.lineWidth = 1.5;
		}

		if(winner != 1) {
			context.textBaseline = "hanging";
			context.textAlign = "left";
			if(winner == 0) {
				context.fillStyle = this.colorToStyle(this.interpolateColor(this.interpolateColor(this.colors[0], this.backgroundColor, winTranslucency), [255, 255, 255], winBrightness));
			} else {
				context.fillStyle = this.colorToStyle(this.interpolateColor(this.colors[0], this.backgroundColor, translucency));
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
			context.fillStyle = this.colorToStyle(this.interpolateColor(this.interpolateColor(this.colors[1], this.backgroundColor, winTranslucency), [255, 255, 255], winBrightness));
		} else {
			context.fillStyle = this.colorToStyle(this.interpolateColor(this.colors[1], this.backgroundColor, translucency));
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
		context.fillStyle = this.colorToStyle(this.interpolateColor(this.interpolateColor(this.colors[0], this.colors[1], 0.5), this.backgroundColor, translucency));
		context.fillText("versus", this.size * 0.5, this.size * 0.5);
		context.strokeText("versus", this.size * 0.5, this.size * 0.5);

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

		var scale = 1.07;
		context.save();
		context.beginPath();
		var block_x = location[0] * this.spacing + this.spacing * (1 - scale) / 2;
		var block_y = location[1] * this.spacing + this.spacing * (1 - scale) / 2;
		var block_size = this.spacing * scale;
		context.rect(block_x, block_y, block_size, block_size);
		context.clip();
		
		context.drawImage(this.backgroundImage, block_x, block_y, block_size, block_size, block_x, block_y, block_size, block_size);

		var scale = 1.1;
		context.beginPath();
		context.rect(location[0] * this.spacing + this.spacing * (1 - scale) / 2, location[1] * this.spacing + this.spacing * (1 - scale) / 2, this.spacing * scale, this.spacing * scale);

		var trail = this.trail[location[1]][location[0]];
		for (var i = 0; i < trail.length; ++i) {
			context.fillStyle = this.colorToStyle(this.interpolateColor(this.colors[trail[i][0]], this.trailColor, trail[i][1])
								                  .concat(this.trailAlpha * Math.pow((i + 1) / trail.length, 0.7)));
			context.fill();
		}
		
		context.strokeStyle = "#101020";
		context.lineWidth = 3.5;
		context.lineJoin = "miter";
		context.stroke();
	
		if(this.board[location[1]][location[0]]) {
			var scale = 0.95;
			context.strokeStyle = "#201144";
			context.lineWidth = 2;
			context.fillStyle = "#9977B0";
			context.beginPath();
			context.rect(location[0] * this.spacing + this.spacing * (1 - scale) / 2, location[1] * this.spacing + this.spacing * (1 - scale) / 2, this.spacing * scale, this.spacing * scale);
			context.fill();
			context.stroke();
		}

		if (location == this.loc[0] && location == this.loc[1]) {
			for (var player = 0; player < 2; ++player) {
				this.drawPlayer(context, this.loc[player], this.colors[player].concat(0.3));
			}
		} else {
			for (var player = 0; player < 2; ++player) {
				if (location == this.loc[player]) {
					this.drawPlayer(context, this.loc[player], this.colors[player]);
				}
			}
		}

		context.restore();

	},

	getContext: function() {
		return this.canvas.getContext("2d");
	},

	interpolateColor: function(color1, color2, weight) {
		return [Math.floor(color1[0] * (1 - weight) + color2[0] * weight),
		        Math.floor(color1[1] * (1 - weight) + color2[1] * weight),
		        Math.floor(color1[2] * (1 - weight) + color2[2] * weight)];
	},

	colorToStyle: function(color) {
		if (color.length == 3) {
			return '#' + (0x1000000 + color[0]*0x10000 + color[1]*0x100 + color[2]).toString(16).substring(1);
		} else {
			return "rgba(" + color[0].toString() + ", " + color[1].toString() + ", " + color[2].toString() + ", " + color[3].toString() + ")";
		}
	},

	getTrailBlend: function(moves) {
		const mean = 0.3;
		const amp = 0.15;
		const period = 20;
		return Math.pow(mean + amp * Math.sin(moves * 2 * Math.PI / period), 1.6);
	},

	move: function() {
		
		var player = this.nextInt();
		var context = this.getContext();
		var e = this.next();
		
		if(e == 'moved') {
			this.next(); // direction
			this.next(); // to
			var x = this.nextInt();
			var y = this.nextInt();
			var oldLoc = this.loc[player];
			this.loc[player] = [x, y];
			this.drawBlock(context, oldLoc)
			this.moves[player] += 1;
			this.trail[y][x].push([player, this.getTrailBlend(this.moves[player])]);
			this.drawPlayer(context, this.loc[player], this.colors[player]);
			setTimeout($.proxy(this.move, this), this.timeout);
		
		} else if(e == 'blocked') {
			var x = this.nextInt();
			var y = this.nextInt();
			this.board[y][x] = true;
			this.drawBlock(context, [x, y]);
			setTimeout($.proxy(this.move, this), this.timeout);

		} else {

			context.fillStyle = "rgba(0, 0, 0, 0.35)";
			context.fillRect(0, 0, this.size, this.size);

			this.drawText(context, player);

		}

	},

}