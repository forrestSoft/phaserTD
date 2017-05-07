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

			let dynamicParams = GLOBALS.towers.towers[this.brush]

			Object.assign(this.weapon,{
				bulletClass: Bullet,
				bounds: game.inputMasks.board._localBounds,
	            bulletBounds: game.inputMasks.board._localBounds,
	            fireFrom: new Phaser.Rectangle({ x: this.sprite.centerX, y: this.sprite.centerY, width: 1, height:1 }),
	            enableBody: true,
	    		physicsBodyType: Phaser.Physics.ARCADE,
	    		bulletSpeed: dynamicParams.bulletSpeed,// 75, //275
	    		bulletAngleOffset: dynamicParams.bulletAngleOffset,
	    		fireRate: dynamicParams.firingInterval,
	    		fireInterval: 1, //55
	    		fireIntervalMod: 1,
	    		rangeModifier: -1000,
	    		bulletRotateToVelocity: true,
	    		lastFire: 0,
	    		// x: this.x + 8,
	    		// y: this.y - 8,
	    		fireAngle: dynamicParams.fireAngle,
	    		bulletKillDistance: dynamicParams.rangeRadius,
	    		damageValue: dynamicParams.damage

			})
            
        	this.weapon.createBullets(1, 'weapons', 'bulletBeigeSilver_outline.png', this.group)
        	
			this.weapon.bullets.forEach((b,i) => {
				// console.log(b,i)
			    // b.scale.setTo(.2, .2)
			    // b.body.updateBounds()
			    b.scale.setTo(.25, .25)
			    b.body.setSize(6, 4, 6, 18);
			    // b.body.syncBounds = true
			    b.body.updateBounds();
			    b.body.preUpdate = this.tappedPreUpdate.bind(b.body)
			    b.data.name = i
			    b.damageValue = dynamicParams.damageValue
			    console.log(b.body)
			}, this);

    		game.physics.enable(this.weapon, Phaser.Physics.ARCADE)

    		this.weapon.update = ()=>{
    			// debugger
    			let target = GLOBALS.groups.creeps.getClosestTo(this.sprite)
    			if(!target){
    				return
    			}

    			let angle
    			let coords = {
    				x:this.sprite.centerX, 
					y: this.sprite.centerY,
					x2:target.centerX, 
					y2: target.centerY //+ 16
    			}

				let dist = game.physics.arcade.distanceBetween({x:coords.x, y: coords.y},{x:coords.x2, y: coords.y2})

				if(dist > GLOBALS.towers.towers[this.brush].rangeRadius + 8){
					return
				}

				if(this.weapon.lastFire < this.weapon.fireInterval){
					this.weapon.lastFire ++
					if(this.weapon.lastFire%this.weapon.fireIntervalMod != 0 ){
						return
					}
				}
				
				if(this.weapon.lastFire % this.weapon.fireIntervalMod == 0 && this.weapon.lastFire == this.weapon.fireInterval){
				 	var fA = this.firingSolution.call(this,target)
				 	if(fA != null){
					 	angle = game.physics.arcade.angleToXY(this.sprite, fA.x,fA.y+16, false)
				 	}else{
				 		console.log('fail')
				 		return
				 	}
					this.weapon.fireAngle = jMath.degrees(angle)
					this.sprite.rotation = angle
				 	this.weapon.fire({x:this.sprite.centerX, y:this.sprite.centerY-16}, null,null,0, 0)

					this.weapon.lastFire = 0
				}
				
			}

    		return this
		},
		buildTower(){
			this.sprite = game.add.sprite(this.x+GLOBALS.tH/2,this.y+GLOBALS.tW/2, 'ms', this.brush)
			// this.sprite.alpha = 0	
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
			this.rangeIndicator.drawCircle(this.sprite.x,this.sprite.y,GLOBALS.towers.towers[this.brush].rangeRadius*2)
		},
		hideRange(){
			this.rangeIndicator.alpha = 0
		},
		showRange(){
			this.rangeIndicator.alpha = 1
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
		},
		tappedPreUpdate() {

	        if (!this.enable || this.game.physics.arcade.isPaused)
	        {
	            return;
	        }

	        this.dirty = true;

	        //  Store and reset collision flags
	        this.wasTouching.none = this.touching.none;
	        this.wasTouching.up = this.touching.up;
	        this.wasTouching.down = this.touching.down;
	        this.wasTouching.left = this.touching.left;
	        this.wasTouching.right = this.touching.right;

	        this.touching.none = true;
	        this.touching.up = false;
	        this.touching.down = false;
	        this.touching.left = false;
	        this.touching.right = false;

	        this.blocked.up = false;
	        this.blocked.down = false;
	        this.blocked.left = false;
	        this.blocked.right = false;

	        this.overlapR = 0;
	        this.overlapX = 0;
	        this.overlapY = 0;

	        this.embedded = false;

	        this.updateBounds();
	
	        this.position.x = (this.sprite.x - (this.sprite.anchor.x * this.sprite.width)) + this.sprite.scale.x * this.offset.x;
	        this.position.x -= this.sprite.scale.x < 0 ? this.width : 0;

	        this.position.y = (this.sprite.y - (this.sprite.anchor.y * this.sprite.height)) + this.sprite.scale.y * this.offset.y;
	        this.position.y -= this.sprite.scale.y < 0 ? this.height : 0;
	        this.position.y += 16
	        this.rotation = this.sprite.angle;

	        this.preRotation = this.rotation;

	        if (this._reset || this.sprite.fresh)
	        {
	            this.prev.x = this.position.x;
	            this.prev.y = this.position.y;
	        }

	        if (this.moves)
	        {
	            this.game.physics.arcade.updateMotion(this);

	            this.newVelocity.set(this.velocity.x * this.game.time.physicsElapsed, this.velocity.y * this.game.time.physicsElapsed);

	            this.position.x += this.newVelocity.x;
	            this.position.y += this.newVelocity.y;
	
	            if (this.position.x !== this.prev.x || this.position.y !== this.prev.y)
	            {
	                this.angle = Math.atan2(this.velocity.y, this.velocity.x);
	            }

	            this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

	            //  Now the State update will throw collision checks at the Body
	            //  And finally we'll integrate the new position back to the Sprite in postUpdate

	            if (this.collideWorldBounds)
	            {
	                if (this.checkWorldBounds() && this.onWorldBounds)
	                {
	                    this.onWorldBounds.dispatch(this.sprite, this.blocked.up, this.blocked.down, this.blocked.left, this.blocked.right);
	                }
	            }
	        }
	
	        this._dx = this.deltaX();
	        this._dy = this.deltaY();

	        this._reset = false;

	    }
	})
	.init(function ({x,y,brush, group}, {args, instance, stamp}) {
		Object.assign(instance, {x,y,brush, group})
		instance.buildTower()
	})

	