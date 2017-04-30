import stampit from 'stampit'
import Phaser from 'phaser'

import {Builder} from './creeps'

import GLOBALS from '../config/globals'


var Manager = Stampit()

export const TowerManager = Manager.compose(Builder)
	.methods({
		addTower({x,y,brush}){
			let tower =  Tower({x:x,y:y,brush:brush})
			this.addBullets(tower.weapon)
		},
		addBullets(bullets){
			this.bullets.push(bullets.bullets)
		}	
	})
	.init(function ({}, {args, instance, stamp}) {
		instance.bullets = []
		game.bullets = instance.bullets
	})

export const Tower = Stampit()
	.methods({
		buildBullets(){
			this.weapon = game.add.weapon(30, 'weapons', 'bulletBeigeSilver_outline.png', this.group)
			this.weapon.bullets.forEach((b) => {
			    b.scale.setTo(.65, .65);
			    b.body.updateBounds();
			}, this);
			// game.bullets = this.group
			this.weapon.enableBody = true;
    		this.weapon.physicsBodyType = Phaser.Physics.ARCADE;
    		game.physics.enable(this.weapon, Phaser.Physics.ARCADE)
    		this.weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;

    		
    		this.weapon.bulletSpeed = 200;
    		this.weapon.bulletAngleOffset = GLOBALS.towers.towers[this.brush].bulletAngleOffset
    		this.weapon.fireRate = 150;
    		this.weapon.fireInterval = 5
    		this.weapon.fireIntervalMod = 5
    		this.weapon.rangeModifier = -1000
    		this.weapon.lastFire = 0
    		this.weapon.x = this.x + 8
    		this.weapon.y = this.y + 8
    		this.weapon.fireAngle = GLOBALS.towers.towers[this.brush].fireAngle
    		// this.weapon.autofire = true
    		this.weapon.bulletKillDistance = 75
    		// this.weapon.fire()

    		this.weapon.update = ()=>{
    			let angle, angle2
    			// console.log(GLOBALS.boardGroup.children[5].getClosestTo(this.sprite))
    			let target = GLOBALS.boardGroup.children[5].getClosestTo(this.sprite)
    			if(!target){
    				return
    			}
// bullet_travel_time = length(target_pos - our_pos) / bullet_speed

// position_to_aim_at = target_pos + ( normalise(target_direction) * bullet_travel_time )
				let dist = game.physics.arcade.distanceBetween(this.sprite,target)
				// console.log(dist)
				if(dist > GLOBALS.towers.towers[this.brush].range){
					return
				}
				if(this.weapon.lastFire < this.weapon.fireInterval){
					this.weapon.lastFire ++
					if(this.weapon.lastFire%this.weapon.fireIntervalMod != 0 ){
						return
					}
				}

				// console.log(this.weapon.lastFire,this.weapon.fireIntervalMod,this.weapon.lastFire)
				if(this.weapon.lastFire % this.weapon.fireIntervalMod == 0 ){
					let travelTime = dist/this.weapon.bulletSpeed
					let x = target.x// + (target.velocity.x / travelTime)
					// x -= (GLOBALS.towers.towers[this.brush].range - dist) / this.weapon.rangeModifier
					let y = target.y// + (target.velocity.y / travelTime)
					// y -= (GLOBALS.towers.towers[this.brush].range - dist) / this.weapon.rangeModifier
	    			angle = game.physics.arcade.angleToXY(this.sprite, x,y, true)
	    			//angle2 = angle+(15/56)//(50-dist-20)*2/56//-  ((dist /56))// - dist) / this.weapon.rangeModifier)
	    			
	    			// if(dist > 45){
	    			// 	angle2 = angle + (28/56)
	    			// }else if(dist < 45 && dist > 40){
	    			// 	angle2 = angle + (25/56)
    				// }else if(dist < 40 && dist >35){
	    			// 	angle2 = angle + (20/56)
	    			// }else{
	    			// 	angle2 = angle + (3/56)
	    			// }
	    			angle2 = angle//-(1.6-angle)
	    			console.log(dist,angle*56, angle2*56)
	    			// debugger
	    			// console.log(angle*56,angle2*56,dist,(50-dist-20))// / this.weapon.rangeModifier)*56)
	    			// console.log(angle)
	    			this.sprite.rotation = angle2

	    			// 30 -> 3
	    			// 36 -> 23
	    			// 49 -> 29 
	    			// return
				}
				
				
				 if(this.weapon.lastFire % this.weapon.fireIntervalMod == 0 && this.weapon.lastFire == this.weapon.fireInterval){
					this.weapon.fireAngle = angle2*56
					this.weapon.fire()
					// debugger
					console.log(5)
					this.weapon.lastFire = 0
				}
				// return
				// console.log(dist, GLOBALS.towers.towers[this.brush].range)
				// let travelTime = dist/15
				// let x = target.x + (target.velocity.x / travelTime)
				// let y = target.y + (target.velocity.y / travelTime)
    // 			let angle = game.physics.arcade.angleToXY(this.sprite, x,y, true)
    // 			this.sprite.rotation = angle
    			// this.weapon.fireAngle = angle*56
    			// console.log(x,y, target.velocity.normalize())
    			// console.log(target.x, travelTime, target.velocity.x / travelTime)
				// console.log('u', Phaser.Weapon.prototype)
    			// this.stop = true
				// debugger
				// this.weapon.fire()
				// Phaser.Weapon.prototype.update.call(this.weapon)

				// this.lastFire = 15
			}

    		return this
		},
		buildTower(){
			window.towers = []
			this.sprite = game.add.sprite(this.x+GLOBALS.tH/2,this.y+GLOBALS.tW/2, 'ms', this.brush)	
			towers.push(this)
			this.sprite.anchor.x = .5
			this.sprite.anchor.y = .5
			this.sprite.angle = GLOBALS.towers.towers[this.brush].displayAngle
			this.buildBullets()	
		}
	})
	.init(function ({x,y,brush}, {args, instance, stamp}) {
		Object.assign(instance, {x,y,brush})
		instance.buildTower()
	})