import Phaser from 'phaser'

var B = function (game, x, y, key, frame) {
	Phaser.Bullet.call(this,game, x, y, key, frame);
	// console.log(333)
}

B.prototype = Object.create(Phaser.Bullet.prototype);
B.prototype.constructor = B;

export  const Bullet = B