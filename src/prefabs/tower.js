import stampit from 'stampit'
import Phaser from 'phaser'

import Lead from '../engine/leading'
import {jMath} from '../utils'
import {Builder} from './creeps'
import {Bullet} from './bullet'

import GLOBALS from '../config/globals'


var Manager = Stampit()

export const TowerManager = Manager.compose(Builder)
	.methods({
		addTower({x,y,brush}){
			let tower =  Tower({x:x,y:y,brush:brush, group:this.group})
			this.addBullets(tower.weapon)
		},
		addBullets(bullets){
			this.bullets.push(bullets.bullets)
		}	
	})
	.init(function ({group}, {args, instance, stamp}) {
		instance.bullets = []
		game.bullets = instance.bullets
		instance.group = group
	})

export const Tower = Stampit()
	.methods({
		buildBullets(){
			// this.weapon = game.add.weapon(30, 'weapons', 'bulletBeigeSilver_outline.png', this.group, Bullet)
			this.weapon = game.plugins.add(Phaser.Weapon);
            this.weapon.bulletClass = Bullet;
            this.weapon.bounds = game.inputMasks.board._localBounds
            this.weapon.bulletBounds = game.inputMasks.board._localBounds
            this.weapon.fireFrom.x = this.weapon.centerX
            this.weapon.fireFrom.y = this.weapon.centery
            // this.weapon.onKill.add(()=>{console.log('kikk')})
        	this.weapon.createBullets(30, 'weapons', 'bulletBeigeSilver_outline.png', this.group)
        	// return

			this.weapon.bullets.forEach((b) => {
			    b.scale.setTo(.25, .25);
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
    		this.weapon.fireInterval = 10
    		this.weapon.fireIntervalMod = 5
    		this.weapon.rangeModifier = -1000
    		this.weapon.lastFire = 0
    		this.weapon.x = this.x + 8
    		this.weapon.y = this.y - 8
    		this.weapon.fireAngle = GLOBALS.towers.towers[this.brush].fireAngle
    		// this.weapon.autofire = true
    		this.weapon.bulletKillDistance = GLOBALS.towers.towers[this.brush].range/2
    		// this.weapon.fire()

    		this.weapon.update = ()=>{
    			let target = GLOBALS.boardGroup.children[5].getClosestTo(this.sprite)
    			if(!target){
    				return
    			}

    			let angle
    			let coords = {
    				x:this.sprite.centerX, 
					y: this.sprite.centerY,
					x2:target.centerX, 
					y2: target.centerY+16
    			}

				let dist = game.physics.arcade.distanceBetween({x:coords.x, y: coords.y},{x:coords.x2, y: coords.y2})
				window.dist = coords
				game.debug.body(target)
				if(dist > GLOBALS.towers.towers[this.brush].range/2){
					return
				}

				if(this.weapon.lastFire < this.weapon.fireInterval){
					this.weapon.lastFire ++
					if(this.weapon.lastFire%this.weapon.fireIntervalMod != 0 ){
						return
					}
				}

				if(this.weapon.lastFire % this.weapon.fireIntervalMod == 0 ){
					let x = target.x
					let y = target.y
					
	    			angle = game.physics.arcade.angleToXY(this.sprite, x,y, false)
	    			if(this.weapon.lastFire == this.weapon.fireInterval){
		    			this.sprite.rotation = angle
		    		}
				}
				
				 if(this.weapon.lastFire % this.weapon.fireIntervalMod == 0 && this.weapon.lastFire == this.weapon.fireInterval){
				 	var fA = this.firingSolution.call(this,target)
				 	if(fA != null){
					 	angle = game.physics.arcade.angleToXY(this.sprite, fA.x,fA.y+16, false)
					 	this.weapon.fire()
				 	}else{
				 		console.log('fail')
				 	}
					this.weapon.fireAngle = jMath.degrees(angle)
					this.sprite.rotation = angle
					
					this.weapon.lastFire = 0
				}
				
				// Phaser.Weapon.prototype.update.call(this.weapon)
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
			this.buildRangeIndicator()
			this.buildBullets()	
		},
		buildRangeIndicator(){
			this.rangeIndicator = game.add.graphics()
			this.rangeIndicator.lineStyle(2, 0x00ffff, 1);
			this.rangeIndicator.drawCircle(this.sprite.x,this.sprite.y,GLOBALS.towers.towers[this.brush].range)
		},
		firingSolution(target){
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

			vel = 20

			return Lead(src,dst,vel)
		}
	})
	.init(function ({x,y,brush, group}, {args, instance, stamp}) {
		Object.assign(instance, {x,y,brush, group})
		instance.buildTower()
	})