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
			GLOBALS.signals.towerPlaced.dispatch()
		},
		addBullets(bullets){
			this.bullets.push(bullets.bullets)
		}	
	})
	.init(function ({group}, {args, instance, stamp}) {
		Object.assign(instance, {
			group,
			bullets: [],
			towers: []
		})

		game.bullets = instance.bullets
		window.towers = instance.towers
	})

export const Tower = Stampit()
	.methods({
		buildBullets(){
			this.weapon = game.plugins.add(Phaser.Weapon);
			Object.assign(this.weapon,{
				bulletClass: Bullet,
				bounds: game.inputMasks.board._localBounds,
	            bulletBounds: game.inputMasks.board._localBounds,
	            fireFrom: { x: this.weapon.centerX, y: this.weapon.centerY },
	            enableBody: true,
	    		physicsBodyType: Phaser.Physics.ARCADE,
	    		bulletSpeed: 70,
	    		bulletAngleOffset: GLOBALS.towers.towers[this.brush].bulletAngleOffset,
	    		fireRate: 150,
	    		fireInterval: 75,
	    		fireIntervalMod: 5,
	    		rangeModifier: -1000,
	    		bulletRotateToVelocity: true,
	    		lastFire: 0,
	    		x: this.x + 8,
	    		y: this.y - 8,
	    		fireAngle: GLOBALS.towers.towers[this.brush].fireAngle,
	    		bulletKillDistance: GLOBALS.towers.towers[this.brush].range/2,

			})
            
        	this.weapon.createBullets(30, 'weapons', 'bulletBeigeSilver_outline.png', this.group)

			this.weapon.bullets.forEach((b) => {
			    b.scale.setTo(.2, .2);
			    b.body.updateBounds();
			    b.scale.setTo(.25, .25);
			}, this);

    		game.physics.enable(this.weapon, Phaser.Physics.ARCADE)

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
			}

    		return this
		},
		buildTower(){
			this.sprite = game.add.sprite(this.x+GLOBALS.tH/2,this.y+GLOBALS.tW/2, 'ms', this.brush)	
			towers.push(this)

			Object.assign(this.sprite, {
				anchor: {x: .5, y: .5},
				angle: GLOBALS.towers.towers[this.brush].displayAngle,
				inputEnabled: true	
			})
			
			this.sprite.events.onInputOver.add(this.showRange, this)
			this.sprite.events.onInputOut.add(this.hideRange, this)

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