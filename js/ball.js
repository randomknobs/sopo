SP.Ball = function(size) {
	this.size = size || 30;
	this.pos = [0, 0];
	this.v = [0, 0];
	this.speed = 0.6;
};

SP.Ball.prototype.moveTo = function(goal) {
	this.pos = goal;
};

SP.Ball.prototype.start = function(dir) {
	var norm = this.speed / Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
	dir[0] *= norm;
	dir[1] *= norm;
	this.v = dir;
};

SP.Ball.prototype.stop = function() {
	this.v = [0, 0];
};

SP.Ball.prototype.bounce = function(edgeDir) {
	// initially only four possible directions
	if (edgeDir[0] !== 0 && edgeDir[1] == 0) {
		// left or right
		this.v[0] = -this.v[0];
		this.pos[0] -= edgeDir[0];
	} else if (edgeDir[0] == 0 && edgeDir[1] !== 0) {
		// top or bottom
		this.v[1] = -this.v[1];
		this.pos[1] -= edgeDir[1];
	} else {
		// corner
		if (this.v[0] * edgeDir[0] > 0) {
			this.v[0] = -this.v[0];
		}
		if (this.v[1] * edgeDir[1] > 0) {
			this.v[1] = -this.v[1];
		}
		this.pos[0] -= edgeDir[0];
		this.pos[1] -= edgeDir[1];
	}
};

SP.Ball.prototype.position = function() {
	return this.pos;
};

SP.Ball.prototype.radius = function() {
	return this.size / 2;
};

SP.Ball.prototype.move = function(t) {
	this.pos[0] += t * this.v[0];
	this.pos[1] += t * this.v[1];
};