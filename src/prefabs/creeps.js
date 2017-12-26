import stampit from 'stampit'
import Phaser from 'phaser'
import tinycolor from 'tinycolor2'
import nearestColor from 'nearest-color'
import chroma from 'chroma-js'

import { Points } from '../utils'

import GLOBALS from '../config/globals'

import { SpriteTinter } from '../engine/pixelTransform'

export const Builder = stampit().methods({
	create_object(object) {
		let object_y, position, prefab
		// object_y = object_y//(object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
		position = { x: object.x, y: object.y }
		if (GLOBALS.prefab_classes.hasOwnProperty(object.type)) {
			prefab = new GLOBALS.prefab_classes[object.type](this.state, object.name, position, object.properties)
		}
		return prefab
	}
})

export const Manager = stampit()

export const CreepManager = Manager.compose(Builder)
	.methods({
		buildCreeps() {
			this.creeps = game.make.group(null, 'creeps')
			GLOBALS.groups.creeps = this.creeps
			// this.creeps.fixedToCamera = false;
			// this.creeps.enableBody = true
			// this.creeps.physicsBodyType = Phaser.Physics.ARCADE;
			// game.physics.arcade.enable(this.creeps, Phaser.Physics.ARCADE);
			this.group.addChild(this.creeps)

			GLOBALS.signals.waveStart.add(this.start, this)
		},
		buildCreep(num = 1) {
			if (num <= 0) {
				this.timer.add(Phaser.Timer.SECOND * this.nextWaveInterval(), this.wave, this)
				return
			}

			let percent = num % 4 == 0 ? 0 : this.bossPercent*10
			let texture
			let name = GLOBALS.creeps[this.nextCreepType].properties.texture

			if(!game.cache.checkImageKey('sprites_'+name+percent)){
				console.log('texture not found, building')
				texture = SpriteTinter(percent, name, GLOBALS.creeps[this.nextCreepType].properties.hue )
			}else{
				texture = game.cache.getImage('sprites_'+name+percent)
			}

			let type = name
			let level = 0
			
			let data = Object.assign({},
				{
					x: GLOBALS.entrance.columnPX + 8,
					y: GLOBALS.entrance.rowPX
				},
				GLOBALS.creeps[this.nextCreepType],
			)

			let props = Object.assign({}, GLOBALS.creeps[this.nextCreepType].getData(0))
			props.texture = 'sprites_'+name+percent
			data.properties = props
			// debugger
			let prefab = this.create_object(data, this.state)
			this.creeps.add(prefab)
			this.creeps.sendToBack(prefab)

			this.timer.add(Phaser.Timer.SECOND * this.nextCreepInterval(), this.buildCreep.bind(this, --num), this)
			this.timer.start()
		},
		getGroup() {
			return this.creeps
		},
		start() {
			this.wave()
			// this.buildCreep(1)
		},
		wave() {
			// console.group('wave')

			this.team++
			GLOBALS.player.wave = this.team
			// console.log('Team:', this.team)
			this.checkDifficulty()
			this.setNextCreepType()

			this.buildCreep(1)
			// console.groupEnd('wave')
		},
		checkDifficulty() {
			if (this.team % 8 == 0) {
				this.difficultyMin += Phaser.Math.between(1, 2)
			}

			if (this.team % 12 == 0) {
				this.difficultyMax += Phaser.Math.between(2, 3)
			}
		},
		setNextCreepType() {
			this.nextCreepType = Phaser.Math.between(0, 2)
		},
		nextWaveInterval() {
			let i = Phaser.Math.random(1.5, 2)
			// console.log('next wave interval:', i)
			return i
		},
		nextCreepInterval() {
			let i = Phaser.Math.random(0.75, 1)
			// console.log('next creep interval:', i)
			return i
		},
		nextWaveSize() {
			let i = Phaser.Math.between(this.difficultyMin, this.difficultyMax)
			// console.log('next wave size:', i)
			return i
		},
		bossNext(){
			if(this.difficultyMin % GLOBALS.creeps[this.nextCreepType].bossInterval){
				this.nextBossEnabled = true
				this.bossPercent = 25
			}
		}
	})
	.init(function({ data, state, group }, { args, instance, stamp }) {
		Object.assign(instance, {
			data,
			state,
			group,
			timer: game.time.create(false),
			nextCreep: 0.1,
			difficultyMin: 1,
			difficultyMax: 3,
			team: 0,
			nextCreepType: 0,
			nextBossEnabled: false,
			bossPercent: 0
		})
		instance.buildCreeps()

		// game.time.events.repeat(Phaser.Timer.SECOND * GLOBALS.waves.beforeBegin, 1, this.start, this);
	})
