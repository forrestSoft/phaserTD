import Phaser from 'phaser'

var B = function (game, x, y, key, frame) {
	Phaser.Bullet.call(this,game, x, y, key, frame);
	// console.log(333)
}

B.prototype = Object.create(Phaser.Bullet.prototype);
B.prototype.constructor = B;

B.prototype.update = function(){
	// console.log('update', arguments)
	if (!this.exists)
    {
        return
    }

    if (this.data.rotateToVelocity)
    {   
        console.log(1)
        let dR = Math.atan2(this.body.velocity.y, this.body.velocity.x)
        this.rotation = dR
        this.body.rotation = dR
        // debugger
    }

    // console.log(this, this.data.fromX, this.data.fromY,this.data.killDistance,this.game.physics.arcade.distanceToXY(this, this.data.fromX, this.data.fromY, true) )
    if (this.game.physics.arcade.distanceToXY(this, this.data.fromX, this.data.fromY, true) > this.data.killDistance){
        this.kill()
        return
    }	
    // console.log(this.data.bulletManager.bulletBounds,this.data.bulletManager.bulletBounds.intersects(this))

    if (!this.data.bulletManager.bulletBounds.intersects(this)){
        this.kill()
        return
    }
}

export  const Bullet = B