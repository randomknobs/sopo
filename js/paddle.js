SP.Paddle = function(size) {
	this.s = size || [100, 20];
	this.pos = 0.5;
	this.speed = 0.0005;
	this.v = 0;
};

SP.Paddle.prototype.moveTo = function(goal) {
	this.goal = goal >= 0 ? (goal <= 1 ? goal : 1) : 0;
	this.v = 0;
};

SP.Paddle.prototype.moveUp = function() {
	this.goal = undefined;
	this.v = this.speed;
};

SP.Paddle.prototype.moveDown = function() {
	this.goal = undefined;
	this.v = -this.speed;
};

SP.Paddle.prototype.stop = function() {
	this.goal = undefined;
	this.v = 0;
};

SP.Paddle.prototype.position = function() {
	return this.pos;
};

SP.Paddle.prototype.size = function() {
	return this.s;
};

SP.Paddle.prototype.move = function(t) {
	if (this.goal) {
		if (this.pos < this.goal && this.pos + t*this.speed < this.goal) {
			this.pos += t * this.speed;
		} else if (this.pos > this.goal && this.pos - t*this.speed > this.goal) {
			this.pos -= t * this.speed;
		}	else {
			this.pos = this.goal;
		}
	} else {
		this.pos += t * this.v;
	}
	this.pos = this.pos < 0 ? 0 : (this.pos > 1 ? 1 : this.pos);
};