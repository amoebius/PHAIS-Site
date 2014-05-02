
visualizer = {

	size: null,
	boardSize: null,
	spacing: null,
	epsilon: 0.0000001,
	names: [null, null],
	colors: [null, null],
	defaultColors: [[0xFF, 0x44, 0x99], [0x44, 0xEE, 0x99]],
	backgroundColor: [0x20, 0x30, 0x40],
	loc: [null, null],
	canvas: null,
	board: null,
	tokens: null,
	timerId: null,

	run: function(canvas, log, size, frequency) {
		this.tokens = log.split(' ').reverse();
		
		this.names[0] = this.next();
		this.next() // versus
		this.names[1] = this.next();
		this.next() // size
		this.boardSize = this.nextInt();
		
		for(var player = 0; player < 2; ++player) {
			// {player} starts at
			for(var i = 0; i < 3; ++i) this.next();
			var x = this.nextInt();
			var y = this.nextInt();
			this.loc[player] = [x, y];
		}

		for(var player = 0; player < 2; ++player) {
			// {player} RGB
			for(var i = 0; i < 2; ++i) this.next();

			const weight = 0.25;
			var r = this.nextInt();
			var g = this.nextInt();
			var b = this.nextInt();
			this.colors[player] = this.interpolateColor([r, g, b], this.defaultColors[player], weight);
		}

		this.board = []
		for(var y = 0; y < this.boardSize; ++y) {
			this.board.push([]);
			for(var x = 0; x < this.boardSize; ++x) {
				this.board[y].push(false);
			}
		}

		this.canvas = canvas;
		this.resize(size);

		this.timeout = 1000.0 / frequency;
		
		setTimeout($.proxy(function() {

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
	},

	draw: function() {
		var context = this.getContext();
		
		context.fillStyle = this.colorToHex(this.backgroundColor);
		context.fillRect(0, 0, this.size, this.size);

		this.drawText(context);

		context.strokeStyle = "#001020";

		for(var y = this.spacing; y < this.size; y += this.spacing) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(this.size, y);
			context.stroke();
		}

		for(var x = this.spacing; x < this.size; x += this.spacing) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, this.size);
			context.stroke();
		}

		for(var y = 0; y < this.boardSize; ++y) {
			for(var x = 0; x < this.boardSize; ++x) {
				if(this.board[y][x]) {
					this.drawBlock(context, [x, y]);
				}
			}
		}

		for(var player = 0; player < 2; ++player) {
			this.drawPlayer(context, this.loc[player], this.colors[player]);
		}
	},

	drawText: function(context, winner) {
		context.font = "140px bold sans-serif 'Six Caps'";
		context.strokeStyle = "#555599";
		const translucency = 0.82;
		const winTranslucency = 0.1;
		const winBrightness = 0.75;
		const xFactor = 0.1;
		const yFactor = 0.17;
		const yComp = 0.013;

		if(winner == 1 || winner == 0) {
			context.strokeStyle = "#001188";
		}

		if(winner != 1) {
			context.textBaseline = "hanging";
			context.textAlign = "left";
			if(winner == 0) {
				context.fillStyle = this.colorToHex(this.interpolateColor(this.interpolateColor(this.colors[0], this.backgroundColor, winTranslucency), [255, 255, 255], winBrightness));
			} else {
				context.fillStyle = this.colorToHex(this.interpolateColor(this.colors[0], this.backgroundColor, translucency));
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
			context.fillStyle = this.colorToHex(this.interpolateColor(this.interpolateColor(this.colors[1], this.backgroundColor, winTranslucency), [255, 255, 255], winBrightness));
		} else {
			context.fillStyle = this.colorToHex(this.interpolateColor(this.colors[1], this.backgroundColor, translucency));
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
		context.fillStyle = this.colorToHex(this.interpolateColor(this.interpolateColor(this.colors[0], this.colors[1], 0.5), this.backgroundColor, translucency));
		context.fillText("versus", this.size * 0.5, this.size * 0.5);
		context.strokeText("versus", this.size * 0.5, this.size * 0.5);

	},

	drawPlayer: function(context, location, color) {
		context.fillStyle = this.colorToHex(color);
		context.strokeStyle = "#FFFFFF";
		context.beginPath();
		context.arc(location[0] * this.spacing + this.spacing / 2, location[1] * this.spacing + this.spacing / 2, this.spacing / 2.5, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	},

	drawBlock: function(context, location, player) {
		const scale = 0.92;
		if(this.board[location[1]][location[0]]) {
			context.strokeStyle = "#001144";
			context.fillStyle = "#9977B0";
			context.beginPath();
			context.rect(location[0] * this.spacing + this.spacing * (1 - scale) / 2, location[1] * this.spacing + this.spacing * (1 - scale) / 2, this.spacing * scale, this.spacing * scale);
			context.fill();
			context.stroke();
		} else {
			context.save();
			context.beginPath();
			context.rect(location[0] * this.spacing + this.spacing * (1 - scale) / 2, location[1] * this.spacing + this.spacing * (1 - scale) / 2, this.spacing * scale, this.spacing * scale);
			context.fillStyle = this.colorToHex(this.interpolateColor(this.colors[player], this.backgroundColor, 0.93));
			context.fill();
			context.clip();
			this.drawText(context);
			context.restore();
		}
	},

	getContext: function() {
		return this.canvas.getContext("2d");
	},

	interpolateColor: function(color1, color2, weight) {
		return [Math.floor(color1[0] * (1 - weight) + color2[0] * weight),
		        Math.floor(color1[1] * (1 - weight) + color2[1] * weight),
		        Math.floor(color1[2] * (1 - weight) + color2[2] * weight)];
	},

	colorToHex: function(color) {
		return '#' + (0x1000000 + color[0]*0x10000 + color[1]*0x100 + color[2]).toString(16).substring(1);
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
			this.drawBlock(context, this.loc[player], player)
			this.loc[player] = [x, y];
			this.drawPlayer(context, this.loc[player], this.colors[player]);
			setTimeout($.proxy(this.move, this), this.timeout);
		
		} else if(e == 'blocked') {
			var x = this.nextInt();
			var y = this.nextInt();
			this.board[y][x] = true;
			this.drawBlock(context, [x, y]);
			setTimeout($.proxy(this.move, this), this.timeout);

		} else {

			this.drawText(context, player);
			context.fillStyle = "rgba(0, 0, 0, 0.65)";
			context.fillRect(0, 0, this.size, this.size);

		}

	},

}