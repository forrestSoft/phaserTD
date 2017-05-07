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
			GLOBALS.groups.creeps = this.creeps
		    this.creeps.fixedToCamera = false;
			// this.creeps.y = GLOBALS.globalOffset.y
			// this.creeps.x = GLOBALS.globalOffset.x
			this.creeps.enableBody = true
   			this.creeps.physicsBodyType = Phaser.Physics.ARCADE;
			game.physics.arcade.enable(this.creeps, Phaser.Physics.ARCADE);
			this.group.addChild(this.creeps)

			GLOBALS.signals.waveStart.add(this.start, this)
		},
		buildCreep(num = 1){
			if(num <= 0){
				this.timer.add(Phaser.Timer.SECOND * this.nextCreep, this.creep, this)
				return
			}

			let data = Object.assign({}, {
				x:GLOBALS.entrance.columnPX + 8,
				y:GLOBALS.entrance.rowPX
				},GLOBALS.creeps[this.nextCreepType])

			let prefab = this.create_object(data ,this.state)
			this.creeps.add(prefab)
			this.creeps.sendToBack(prefab)


			this.timer.add(Phaser.Timer.SECOND * Phaser.Math.random(.75, 1.5), this.buildCreep.bind(this, --num), this)
			this.timer.start()
		},
		getGroup(){
			return this.creeps
		},
		start(){
			this.wave()
		},
		wave(){
			this.creep()
		},
		creep(){
			this.team ++
			if(this.team % 3 == 0){
				this.difficultyMin += 3
			}

			if(this.team % 5 == 0){
				this.difficultyMax += 2
			}

			this.buildCreep(Math.floor(Phaser.Math.random(this.difficultyMin,this.difficultyMax)))
			this.nextCreep = Phaser.Math.random(.75, 2.5)
			this.nextCreepType = Phaser.Math.between(0,1)
		}
	})
	.init(function ({data, state, group}, {args, instance, stamp}) {
		Object.assign(instance, {data, state, group,
			timer: game.time.create(false),
			nextCreep: .1,
			difficultyMin: 1,
			difficultyMax: 3,
			team: 0,
			nextCreepType: 0
		})
		instance.buildCreeps()
		

		// game.time.events.repeat(Phaser.Timer.SECOND * GLOBALS.waves.beforeBegin, 1, this.start, this);
	})