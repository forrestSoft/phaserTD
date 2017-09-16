import Phaser from 'phaser'

import Lead from '../engine/leading'

var W = function (game, x, y, key, frame) {
	Phaser.Weapon.call(this,game, x, y, key, frame);
}

W.prototype = Object.create(Phaser.Weapon.prototype);
W.prototype.constructor = W;

W.prototype.update = function(){
	if(this.lastFire < this.fireInterval){
		this.lastFire ++
		if(this.lastFire%this.fireIntervalMod != 0 ){
			return
		}
	}

	let getTargetDistance = () => {
		let coords = {
			x:  this.x, 
			y:  this.y,
			x2: this.target.centerX, 
			y2: this.target.centerY
		}

		return game.physics.arcade.distanceBetween({x:coords.x, y: coords.y},{x:coords.x2, y: coords.y2})
	}

	if(this.target){
		let dead = this.target.life <= 0
		if(dead){
			this.target = GLOBALS.groups.creeps.getClosestTo(this.sprite)
		}

		if(!this.target){
			return
		}
		let tooFar = getTargetDistance() > GLOBALS.towers.towers[this.brush].rangeRadius + 4
		let outOfBounds = this.target._exists == false

		if(tooFar || outOfBounds){
			this.target = GLOBALS.groups.creeps.getClosestTo(this.sprite)
		}
	}else{
		this.target = GLOBALS.groups.creeps.getClosestTo(this.sprite)
	}

	if(!this.target){
		return
	}

	if(getTargetDistance() > GLOBALS.towers.towers[this.brush].rangeRadius + 4){
		return
	}

	let angle

	if(this.lastFire % this.fireIntervalMod == 0 && this.lastFire == this.fireInterval){
		var fA = this.firingSolution.call(this,this.target)
		if(fA != null){
			angle = game.physics.arcade.angleToXY(this.sprite, fA.x,fA.y, false)
		}else{
			console.log('fail')
			return
		}
		this.fireAngle = Phaser.Math.radToDeg(angle)
		this.sprite.rotation = angle
		this.fire({x:this.sprite.centerX, y:this.sprite.centerY}, null,null,0, 0)

		this.lastFire = 0
	}
	return this
}

W.prototype.firingSolution = function(target){
		let src, dst, vel
		dst = {
			x:  target.x,
			y:  target.y,
			vx: target.velocity.x,
			vy: target.velocity.y
		}

		src = {
			x: this.sprite.x,
			y:this.sprite.y
		}

		vel = 10

		return Lead(src,dst,vel)
	}

export default W