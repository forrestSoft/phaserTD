import stampit from 'stampit'
import Phaser from 'phaser'

import {Points} from '../utils'

import GLOBALS from '../config/globals'

export const Builder = Stampit()
	.methods({
		create_object (object) {
			let object_y, position, prefab;
			// object_y = object_y//(object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
			position = {"x": object.x , "y": object.y};
			if (GLOBALS.prefab_classes.hasOwnProperty(object.type)) {
			  prefab = new GLOBALS.prefab_classes[object.type](this.state, object.name, position, object.properties);
			}
			return prefab
		}
	})

export const Manager = Stampit()

export const CreepManager = Manager.compose(Builder)
	.methods({
		buildCreeps(){
			this.creeps = game.make.group(null,'creeps')
		    this.creeps.fixedToCamera = false;
			// this.creeps.y = GLOBALS.globalOffset.y
			// this.creeps.x = GLOBALS.globalOffset.x
			this.creeps.enableBody = true
   			this.creeps.physicsBodyType = Phaser.Physics.ARCADE;
			game.physics.arcade.enable(this.creeps, Phaser.Physics.ARCADE);
			this.group.addChild(this.creeps)
			// this.group.creeps = 5
			// this.creeps.classType = GLOBALS.prefab_classes.player

			GLOBALS.signals.waveStart.add(this.start, this)
		},
		buildCreep(){
			let prefab = this.create_object(this.data,this.state)
			this.creeps.add(prefab)
		},
		getGroup(){
			return this.creeps
		},
		start(){
			game.time.events.repeat(Phaser.Timer.SECOND * 5, 25, this.buildCreep, this);
		}
	})
	.init(function ({data, state, group}, {args, instance, stamp}) {
		Object.assign(instance, {data, state, group})
		instance.buildCreeps()

		// game.time.events.repeat(Phaser.Timer.SECOND * GLOBALS.waves.beforeBegin, 1, this.start, this);
	})