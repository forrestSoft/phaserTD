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
			this.group = game.add.group(undefined, 'bullets', false, true, Phaser.Physics.ARCADE)
			game.bullets = this.group
			this.group.enableBody = true;
    		this.group.physicsBodyType = Phaser.Physics.ARCADE;
    		game.physics.enable(this.group, Phaser.Physics.ARCADE)
    		// this.creeps = game.add.group(undefined, 'creeps', false, true, Phaser.Physics.ARCADE)
		},
		fire(){
			let b = game.make.sprite(this.x,this.y, 'ms', 33)
			// b.enableBody = true;
   //  		b.physicsBodyType = Phaser.Physics.ARCADE;
   //  		game.physics.enable(b, Phaser.Physics.ARCADE)
   			// debugger
    		this.group.add(b)
    		// debugger
    		b.body.velocity.x = 20

		}
	})
	.init(function ({x,y,brush}, {args, instance, stamp}) {
		console.log('tower',args,x,y,brush)
		Object.assign(instance, {x,y,brush})
		this.sprite = game.add.sprite(x,y, 'ms', brush)	
		this.buildBullets()	
		game.time.events.repeat(Phaser.Timer.SECOND * 1, 25, this.fire, this);
	})