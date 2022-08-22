SP.Board = function(size) {
	var c = $("<canvas>");
	$("body").append(c);
	this.canvas = c.get(0);
	this.canvas.width = size[0];
	this.canvas.height = size[1];
	this.boardSize = size;
	
	var width = this.width = size[0];
	var height = this.height = size[1];
	
	this.ctx = this.canvas.getContext('2d');
	this.ctx.font="200px Bangers";
	this.ctx.textAlign = 'center';
	this.ctx.fillStyle = 'white';
	
	var xOrigin = width/2, yOrigin = height/2;
	this.ctx.translate(xOrigin, yOrigin);
	this.ctx.scale(1, 1);
};

SP.Board.prototype.clear = function() {
	var w = this.canvas.width,
		h = this.canvas.height;
	this.ctx.clearRect(-w/2, -h/2, w, h);
};

SP.Board.prototype.rectangle = function(pos, size, color) {
	this.ctx.beginPath();
	this.ctx.rect(pos[0] - size[0] / 2, pos[1] - size[1] / 2, size[0], size[1]);
	this.ctx.fillStyle = color || 'white';
	this.ctx.fill();
};

SP.Board.prototype.circle = function(pos, radius, color) {
	this.ctx.beginPath();
	this.ctx.arc(pos[0], pos[1], radius, 0, 2 * Math.PI, false);
	this.ctx.fillStyle = color || 'white';
	this.ctx.fill();
};

SP.Board.prototype.getContext = function() {
	return this.ctx;
};

SP.Board.prototype.getCanvas = function() {
	return this.canvas;
};

SP.Board.prototype.collisions = function(pos, radius) {
	var collisions = [];
	if (pos[0] - radius < -this.width/2) {
		// Collision with left wall
		collisions.push([pos[0] - radius + this.width/2,0]);
		game.point(1);
	}
	if (pos[0] + radius > this.width/2) {
		// Collision with right wall
		collisions.push([pos[0] + radius - this.width/2,0]);
		game.point(0);
	}
	if (pos[1] - radius < -this.height/2) {
		//Collision with top wall
		collisions.push([0,pos[1] - radius + this.height/2]);
	}
	if (pos[1] + radius > this.height/2) {
		//Collision with bottom wall
		collisions.push([0,pos[1] + radius - this.height/2]);
	}
	return collisions;
};

SP.Board.prototype.countDown = function(t) {
	this.clear();
	if (t) {
		this.ctx.fillText(t, 0, 70);
	}
	return t;
};

SP.Board.prototype.size = function() {
	return this.boardSize;
};

SP.Board.prototype.globalValues = function(paddles) {
	var gv = [];
	for (var i = 0, size = paddles.length; i < size; ++i) {
		var vertical = i < 2,
			odd = i % 2,
			boardSize = this.boardSize,
			paddle = paddles[i],
			paddleSize = paddle.size(),
			paddlePos = paddle.position(),
			sideLength = vertical ? boardSize[1] : boardSize[0];
			
		var limitedLength = sideLength - paddleSize[1] - 2 * paddleSize[0],
			limit = paddleSize[0] + paddleSize[1] / 2,
			limitedPosition = limit + paddlePos * limitedLength - sideLength / 2;
		
		if (vertical) {
			if (odd) {
				//Right
				gv.push({
					pos: [(boardSize[0] - paddleSize[0]) / 2, -limitedPosition],
					size: paddleSize
				});
			} else {
				//Left
				gv.push({
					pos: [(paddleSize[0] - boardSize[0]) / 2, -limitedPosition],
					size: paddleSize
				});
			}
		} else {
			if (odd) {
				//Top
				gv.push({
					pos: [limitedPosition, (paddleSize[0] - boardSize[1]) / 2],
					size: [paddleSize[1], paddleSize[0]]
				});
			} else {
				//Bottom
				gv.push({
					pos: [limitedPosition, (boardSize[1] - paddleSize[0]) / 2],
					size: [paddleSize[1], paddleSize[0]]
				});
			}
		}	
	}
	return gv;
};













