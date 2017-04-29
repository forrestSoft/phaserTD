import stampit from 'stampit'
import Phaser from 'phaser'

import {Builder} from './creeps'

import GLOBALS from '../config/globals'


var Manager = Stampit()

export const TowerManager = Manager.compose(Builder)
	.methods({
		addTower({x,y,brush}){
			let tower =  Tower({x:x,y:y,brush:brush})
			this.addBullets(tower.group)
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
			this.group = game.add.weapon(30, 'weapons', 'bulletBeigeSilver_outline.png', this.group)
			this.group.bullets.forEach((b) => {
			    b.scale.setTo(.25, .25);
			    b.body.updateBounds();
			}, this);
			// game.bullets = this.group
			this.group.enableBody = true;
    		this.group.physicsBodyType = Phaser.Physics.ARCADE;
    		game.physics.enable(this.group, Phaser.Physics.ARCADE)
    		this.group.bulletKillType = Phaser.Weapon.KILL_DISTANCE;

    		
    		this.group.bulletSpeed = 120;
    		this.group.bulletAngleOffset = GLOBALS.towers.towers[this.brush].bulletAngleOffset
    		this.group.fireRate = 1500;
    		this.group.x = this.x + 8
    		this.group.y = this.y + 8
    		this.group.fireAngle = GLOBALS.towers.towers[this.brush].fireAngle
    		this.group.autofire = true
    		this.group.bulletKillDistance = 75
    		this.group.fire()

    		return this
		}
	})
	.init(function ({x,y,brush}, {args, instance, stamp}) {
		Object.assign(instance, {x,y,brush})
		this.sprite = game.add.sprite(x+GLOBALS.tH/2,y+GLOBALS.tW/2, 'ms', brush)	
		this.sprite.anchor.x = .5
		this.sprite.anchor.y = .5
		this.sprite.angle = GLOBALS.towers.towers[this.brush].displayAngle
		this.buildBullets()	
	})