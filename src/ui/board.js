import stampit from 'stampit'
import {CreepManager} from '../prefabs/creeps'
import {TowerManager} from '../prefabs/tower'
import {TowerReferenceManager} from './towerReferenceManager'

import GLOBALS from '../config/globals'

export var Board = stampit()
	.methods({
		buildMap (){
			let map = this.levelData.map
			this.map = game.add.tilemap(this.name);
			this.map.tilesets.forEach(function (tileset, i) {
				this.map.addTilesetImage(tileset.name, map.tilesets[i])
			}, this);

			return this.map

			this.map.setLayer(1)
		},
		buildForCreate(){
			this.buildTowerManager()
			this.buildLayers()
			this.buildGoal()
			this.buildSpawn()
			this.buildCreepManager()
			this.buildKaboomManager()
			this.buildTowerReferenceManager()
		},
		buildTowerReferenceManager(){
			this.towerReferenceManager = TowerReferenceManager()
			this.towerReferenceManager.setup()
			GLOBALS.towerReferenceManager = this.towerReferenceManager
		},
		buildTowerManager(){
			this.towerManager = TowerManager({
				group: this.groups.towers
			})
			GLOBALS.towerManager = this.towerManager
		},
		buildCreepManager(){
			this.CreepManager = CreepManager({
				state: this.state,
				group: this.groups.board
			})
		},
		buildKaboomManager(){
			//  Explosion pool
			let explosions = game.make.group();

			for (var i = 0; i < 10; i++)
			{
				var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
				explosionAnimation.anchor.setTo(0.5, 0.5);
				explosionAnimation.animations.add('kaboom');
				explosionAnimation.scale.setTo(.25,.25)
			}

			this.groups.board.addChild(explosions)
			GLOBALS.kabooms = explosions
		},
		buildLayers() {
			game.tileMapLayers = {}

			this.map.layers.forEach((layer) => {
				let layerObj = this.map.createLayer(layer.name);
				game.tileMapLayers[layer.name] = layerObj
				this.layers[layer.name] = layerObj
				this.groups.board.addChild(layerObj)
				this.layers[layer.name].fixedToCamera = false;
			}, this)
		},
		buildSpawn(){
			this.groups.board.addChild(game.make.sprite(GLOBALS.entrance.columnPX,GLOBALS.entrance.rowPX,'ms',43))
		},
		buildGoal(){
			this.groups.board.addChild(game.make.sprite(GLOBALS.exit.columnPX,GLOBALS.exit.rowPX,'ms',43))
		}
	})
	.refs({
		name: 'level1'
	})
	.init(function ({groups, layers, state, objects, levelData}, {args, instance, stamp}) {
		Object.assign(instance, {
			groups, layers, state, objects, levelData
		})
	})

