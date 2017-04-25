import stampit from 'stampit'
import Phaser from 'phaser'

import {Builder} from './creeps'

import GLOBALS from '../config/globals'


var Manager = Stampit()

export const TowerManager = Manager.compose(Builder)
	.methods({
		addTower({x,y,brush}){
			console.log('a', x,y,brush)
			return (Tower({x:x,y:y,brush:brush}), this.group)
		}	
	})
	.init(function ({}, {args, instance, stamp}) {
		console.log(arguments)
		// game.time.events.repeat(Phaser.Timer.SECOND * 2.5, 25, this.buildCreep, this);
	})

export const Tower = Stampit()
	.methods({
		buildBullets(){
			this.group = game.add.weapon(30, 'ms', 33, this.group)
			game.bullets = this.group
			// this.group.scale = {x:.5, y:.5}
			this.group.enableBody = true;
    		this.group.physicsBodyType = Phaser.Physics.ARCADE;
    		game.physics.enable(this.group, Phaser.Physics.ARCADE)
    		this.group.bulletKillType = Phaser.Weapon.KILL_DISTANCE;

    		//  The speed at which the bullet is fired
    		this.group.bulletSpeed = 120;

    		//  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    		this.group.fireRate = 1500;
    		this.group.x = this.x + 8
    		this.group.y = this.y + 8
    		this.group.fireAngle = 0
    		this.group.autofire = true
    		this.group.bulletKillDistance = 75
    		this.group.fire()
    		console.log('asdf',this.group)
    		// this.creeps = game.add.group(undefined, 'creeps', false, true, Phaser.Physics.ARCADE)
		}
	})
	.init(function ({x,y,brush}, {args, instance, stamp}) {
		console.log('tower',args,x,y,brush)
		Object.assign(instance, {x,y,brush})
		this.sprite = game.add.sprite(x,y, 'ms', brush)	
		this.buildBullets()	
		// game.time.events.repeat(Phaser.Timer.SECOND * .5, 25, this.fire, this);
	})