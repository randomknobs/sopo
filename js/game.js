SP = {};

SP.Game = function(options) {
	if (options.numberOfPlayers > 2) {
		var x =  options.boardSize[0],
			y =  options.boardSize[1];
		options.boardSize[0] = options.boardSize[1] = x < y ? x : y;
	}
	this.board = new SP.Board(options.boardSize);
	this.canvas = this.board.getCanvas();
	this.started = false;
	
	this.paddles = [];
	this.points = [];
	for (var i = 0; i < options.numberOfPlayers; ++i) {
		this.paddles.push(new SP.Paddle(options.paddleSize));
		this.points.push(0);
	}
	this.ball = new SP.Ball(options.ballSize);
	this.ball.start([Math.random() > 1 ? 1 : -1, Math.random() > 1 ? 1 : -1]);
	
	var scope = this;
	$("body").keydown(function(e) {
		if (e.keyCode == 32) {
			if (scope.requestId) {
				scope.pause();
			} else {
				scope.start();
			}
		} else if (e.keyCode == 83) {
			scope.paddles[1].moveDown();
		} else if (e.keyCode == 87) {
			scope.paddles[1].moveUp();
		}else {
			console.log(e.keyCode);
		}
	}).keyup(function(e) {
		if (e.keyCode == 87 || e.keyCode == 83) {
			scope.paddles[1].stop();
		}
	});
};

SP.Game.prototype.start = function() {
	if (!this.requestId) {
		this.requestId = 1;
		var scope = this,
			t = 3;
		if (this.started) {
			scope.time = new Date().getTime();
			scope.run();
		} else {
			var iv = setInterval(function() {
				if (!scope.board.countDown(t--)) {
					clearInterval(iv);
					scope.time = new Date().getTime();
					scope.run();
					scope.started = true;
				}
			},1000);
		}
	}
};

SP.Game.prototype.pause = function() {
	if (this.requestId) {
		window.cancelAnimationFrame(this.requestId);
		this.requestId = undefined;
	}
};

SP.Game.prototype.run = function() {
	var now = new Date().getTime(),
		diff = now - this.time,
		board = this.board;
		
	board.clear();
	
	// Move objects
	this.move(diff);
	
	// Check collisions
	this.checkCollisions();
	
	// Render objects
	this.render();
	
	this.time = now;
	var scope = this;
	if (this.requestId) {
		this.requestId = window.requestAnimationFrame(scope.run.bind(scope), scope.canvas);
	}
};

SP.Game.prototype.move = function(t) {
	this.ball.move(t);
	for (var i = 0, size = this.paddles.length; i < size; ++i) {
		var p = this.paddles[i];
		p.move(t);
	}
};

SP.Game.prototype.checkCollisions = function() {
	var ball = this.ball,
		col = this.board.collisions(ball.position(), ball.radius());
	for (var i = 0, size = col.length; i < size; ++i) {
		ball.bounce(col[i]);
	}
	
	// Check collisions between paddles and ball
	var gv = this.board.globalValues(this.paddles);
	for (var i = 0, size = gv.length; i < size; ++i) {
		var v = gv[i],
			col = this.intersect(v.pos, v.size, ball.position(), ball.radius());
			if (col) {
				//this.pause();
				//console.log(col);
				//console.log(this.message);
				ball.bounce(col);
			}
	}
};

SP.Game.prototype.render = function() {
	this.board.circle(this.ball.position(), this.ball.radius());
	var gv = this.board.globalValues(this.paddles);
	for (var i = 0, size = gv.length; i < size; ++i) {
		this.board.rectangle(gv[i].pos, gv[i].size);
	}
};

SP.Game.prototype.intersect = function(rectPos, rectSize, circlePos, circleRad) {
	var a = [rectPos[0] - rectSize[0]/2, rectPos[1] - rectSize[1]/2],
		b = [rectPos[0] + rectSize[0]/2, rectPos[1] - rectSize[1]/2],
		c = [rectPos[0] + rectSize[0]/2, rectPos[1] + rectSize[1]/2],
		d = [rectPos[0] - rectSize[0]/2, rectPos[1] + rectSize[1]/2];
	var i;
	if (i = this.pointInCircle(a, circlePos, circleRad)) {
		// Rectangle has top left corner in the circle
		return [i,i];
	} else if (i = this.pointInCircle(b, circlePos, circleRad)) {
		// Rectangle has top right corner in the circle
		return [-i,i];
	} else if (i = this.pointInCircle(c, circlePos, circleRad)) {
		// Rectangle has bottom right corner in the circle
		return [-i,-i];
	} else if (i = this.pointInCircle(d, circlePos, circleRad)) {
		// Rectangle has bottom left corner in the circle
		return [i,-i];
	} else {
		if (i = this.intersectCircle(circlePos, circleRad, [a,b])) {
			// top
			return [0, i];
		} else if (i = this.intersectCircle(circlePos, circleRad, [b,c])) {
			// right
			return [-i ,0];
		} else if (i = this.intersectCircle(circlePos, circleRad, [c,d])) {
			// bottom
			return [0, -i];
		} else if (i = this.intersectCircle(circlePos, circleRad, [d,a])) {
			// left
			return [i ,0];
		}
		return null;
	}
};

SP.Game.prototype.pointInCircle = function(point, position, radius) {
	var pp = [point[0] - position[0], point[1] - position[1]],
		ppLength = Math.sqrt(pp[0] * pp[0] + pp[1] * pp[1]),
		intersection = radius - ppLength;
	return intersection > 0 ? intersection : 0;
};

SP.Game.prototype.pointInRectangle = function(point, position, size) {
	return (point[0] > position[0] - size[0]/2 && point[0] < position[0] + size[0]/2 && point[1] > position[1] - size[1]/2 && point[1] < position[1] + size[1]/2);
};

SP.Game.prototype.intersectCircle = function(position, radius, line) {
	// Get point d as the foot of the perpendicular from line to position
	var a = line[0],
		b = line[1],
		ab = [b[0] - a[0], b[1] - a[1]],
		abLength = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]),
		abn = [ab[0] / abLength, ab[1] / abLength],
		ap = [position[0] - a[0], position[1] - a[1]],
		adScalarProj = ap[0] * abn[0] + ap[1] * abn[1],
		ad = [adScalarProj * abn[0], adScalarProj * abn[1]],
		d = [a[0] + ad[0], a[1] + ad[1]];
	
	// If intersection would be outside the line
	if (adScalarProj < 0 || adScalarProj > Math.abs(abLength)) return 0;
	
	var values = [
		"a: " + a,
		"b: " + b,
		"position: " + position,
		"radius: " + radius,
		"ab: " + ab,
		"abLength: " + abLength,
		"abn: " + abn,
		"ap: " + ap,
		"adScalarProj: " + adScalarProj,
		"ad: " + ad,
		"d: " + d,
		"intersection: " + this.pointInCircle(d, position, radius)
	];
	this.message = values.join("\n");
		
	return this.pointInCircle(d, position, radius);
};

SP.Game.prototype.point = function(id) {
	this.points[id]++;
};

SP.Game.prototype.moveUp = function() {
	this.paddles[0].moveUp();
};

SP.Game.prototype.moveDown = function() {
	this.paddles[0].moveDown();
};

SP.Game.prototype.stop = function() {
	this.paddles[0].stop();
};





