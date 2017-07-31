import stampit from 'stampit'
import Phaser from 'phaser'

import {jMath} from '../utils'
import {Builder} from './creeps'
import {Bullet} from './bullet'
import TowerSprite from './towerSprite'
import Weapon from './weapon'

import GLOBALS from '../config/globals'


var Manager = Stampit()

export const TowerManager = Manager.compose(Builder)
	.methods({
		addTower({x,y,brush,cursorTile}){
			let cost = GLOBALS.towers.towers[brush].cost[0]
			let tower =  Tower({x:x+GLOBALS.globalOffset.x,y:y+GLOBALS.globalOffset.y,brush:brush,cursorTile,group:this.group})
			this.towers.push(tower)
			this.addBullets(tower.weapon)
			GLOBALS.signals.towerPlaced.dispatch(cost)
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
			this.weapon = game.plugins.add(Weapon);

			let dynamicParams = GLOBALS.towers.data(this.brush)

			Object.assign(this.weapon,{
				bulletClass: Bullet,
				bounds: game.inputMasks.board._localBounds,
				bulletBounds: game.inputMasks.board._localBounds,
				// fireFrom: new Phaser.Rectangle({ x: this.sprite.centerX-400, y: this.sprite.centerY, width: 1, height:1 }),
				enableBody: true,
				physicsBodyType: Phaser.Physics.ARCADE,
				bulletSpeed: dynamicParams.bulletSpeed,// 75, //275
				bulletAngleOffset: dynamicParams.bulletAngleOffset,
				fireRate: dynamicParams.firingInterval,
				fireInterval: 5, //55
				fireIntervalMod: 5,
				bulletRotateToVelocity: true,
				lastFire: 0,
				x: this.x,
				y: this.y,
				sprite: this.sprite,
				brush: this.brush,
				// fireAngle: dynamicParams.fireAngle,
				bulletKillDistance: dynamicParams.rangeRadius+28
				// damageValue: dynamicParams.damage
			})

			this.weapon.createBullets(1, 'weapons', 'bulletBeigeSilver_outline.png', this.group)
			
			this.weapon.bullets.forEach((b,i) => {
				let scaleX = dynamicParams.scale && dynamicParams.scale[0] || .25
				let scaleY = dynamicParams.scale && dynamicParams.scale[1] || .25

				b.scale.setTo(scaleX,scaleY)
				b.body.setSize(6, 4, 6, 18);
				// b.body.syncBounds = true
				b.body.updateBounds();
				b.body.preUpdate = this.tappedPreUpdate.bind(b.body)
				b.data.name = i
				b.damageValue = dynamicParams.damageValue
				b.damage = dynamicParams.damage
				b.level = this.level
				b.type = dynamicParams.index
				b.weapon = this.weapon
			}, this)

			this.weapon.fireFrom.setTo(this.sprite.centerX, this.sprite.centerY)

			game.physics.enable(this.weapon, Phaser.Physics.ARCADE)

			this.group.bringToTop(this.sprite)
		},
		buildTower(){
			this.level = 1

			this.sprite = new TowerSprite({
				x: this.x+(GLOBALS.tH/2) - GLOBALS.globalOffset.x,
				y: this.y+(GLOBALS.tW/2) - GLOBALS.globalOffset.y, 
				key:'tank',
				frame:'turret',
				type: this.brush,
				offset:{ 
					x:-2, y:0
				},
				level: this.level,
				doesInput: true,
				doesRange: true
			})

			this.group.addChild(this.sprite)

			this.sprite.towerSprite.events.onInputDown.add(this.menu, this)
			this.sprite.signalOver.add(this.over, this)
			this.sprite.signalOut.add(this.out, this)
			this.buildBullets()

			return this
		},
		over(){
			this.tintTower()
			GLOBALS.signals.display.dispatch({tower: this, header: 'test', type: 'towerOver', brush: this.brush})
		},
		notOver(){
			this.tintTower(true)
		},
		out(){
			GLOBALS.signals.display.dispatch({type: 'towerOut', brush: 'null'})
			this.tintTower(true)
		},
		canUpgrade(){
			let cost = GLOBALS.towers.towers[this.brush].cost[this.level]
			return (GLOBALS.player.gold >= cost)
		},
		tintTower(out){
			if(!this.canUpgrade() && !out){
				this.sprite.towerSprite.tint = 0xff0000
			}else{
				this.sprite.towerSprite.tint = 0xffffff
			}
		},
		menu(){
			if(!this.canUpgrade() || GLOBALS.cursor.towerActive){
				return
			}
			if(this.level < 3){
				let cost = GLOBALS.towers.towers[this.brush].cost[this.level]
				GLOBALS.signals.towerLeveled.dispatch(cost)
				this.level ++
				this.sprite.nextLevel(this.level)
			}else{
				console.log('max')
			}
			this.tintTower()
			GLOBALS.signals.display.dispatch({tower: this, header: 'test', type: 'towerOver', brush: this.brush})
		},
		// over ride positioning based on world to based on sprite local + manual offset
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

			this._reset = false
		}
	})
	.init(function ({x,y,brush,tint,cursorTile,group}, {args, instance, stamp}) {
		Object.assign(instance, {x,y,brush,tint,group, cursorTile})
		instance.buildTower()
	})