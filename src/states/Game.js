/* globals __DEV__ */

import stampit from 'stampit'
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import {Pathfinders, Pathfinder} from '../engine/pathfinding'

import base_level from './base_level'

import { buildBoundInputMask } from '../utils'

import Prefab from '../prefabs/prefab'
import Player from '../prefabs/player'
import {CreepManager} from '../prefabs/creeps'

import GLOBALS from '../config/globals'
import config from '../config/config'

import {Board} from '../ui/board'
import {Cursor, Brush} from '../ui/cursors'
import {Palette} from '../ui/palette'
import {TowerPalette} from '../ui/towerPalette'
import {Display} from '../ui/display'
import {CollisionManager} from '../engine/collisionManager'

export default class extends base_level {
	init () {
		console.time('boot')
		this.buildDynamicGlobals()

		this.level_data = this.cache.getJSON('level1');
		this.globalOffset = GLOBALS.globalOffset

		let tileset_index, tileDimensions, map;
		this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
		this.scale.setUserScale(2,2)
		// this.scale.pageAlignHorizontally = true;
		// this.scale.pageAlignVertically = true;
		
		// start physics system
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		// this.game.physics.arcade.gravity

		this.layers = {}
		this.groups = {
			board: this.game.add.group(undefined,'board'),
			cursor: this.game.add.group(undefined,'cursor'),
			towers: this.game.add.group(undefined,'towers')
		}

		GLOBALS.groups = this.groups
		GLOBALS.splashes = []
		// this.groups.board.ignoreChildInput = true
		this.groups.board.inputEnableChildren = true
		this.prefabs = {}
		this.objects = {}
		this.board = Board({
			name: 'level1',
			mapData: this.level_data.map,
			groups: this.groups,
			layers:this.layers,
			state: this,
			objects: this.objects
		})
		this.display = Display({
			offset: {x:190, y: 130},
		})
		this.map = this.board.buildMap()

		// initialize pathfinding
		tileDimensions = new Phaser.Point(this.board.map.tileWidth, this.board.map.tileHeight)
		const stars = Pathfinders()
		stars.add({
			creep: {
				grid: this.board.map.layers[1].data,
				acceptableTiles: GLOBALS.acceptableTiles, 
				tileDimensions: tileDimensions
			},
			cursor: {
				grid: GLOBALS.currentCollisionLayer(),
				acceptableTiles: GLOBALS.acceptableTiles, 
				tileDimensions: tileDimensions
			}
		})

		GLOBALS.stars = stars
		GLOBALS.boardGroup = this.groups.board

		this.signals = {
			playerMove: new Phaser.Signal()
		}

		this.counters = {
			creepID: 0,
			splashID: 0
		}
	}
	start(){
		GLOBALS.signals.waveStart.dispatch()
	}
	create () {
		let group_name, object_layer, collision_tiles, tile_dimensions, layerObj

		GLOBALS.timers = {
			firstWave: game.time.create(false)
		}

		GLOBALS.timers.firstWave.add(Phaser.Timer.SECOND * GLOBALS.waves.beforeBegin, this.start, this)
		GLOBALS.timers.firstWave.start()

		this.maskBoard()
		this.buildBG()

		this.board.buildForCreate()
		this.display.buildRenderer()

		this.baseLayer = this.layers['background']

		this.palette = Palette({ brushes: GLOBALS.fancyBrushes, fancyBrush: true})
		// this.palette2 = Palette({ y: 0, x: 240})
		this.towerPalette = TowerPalette().build()

		this.groups.board.addChild(this.groups.towers)
		this.cursor = Cursor({p:this, group: this.groups.cursor})
		this.groups.board.addChild(this.groups.cursor)

		this.brush = Brush()

		game.inputMasks.board.events.onInputDown.add(this.onClick, this)

		window.g = this.game
		window.t = this
		this.groups.board.y = this.globalOffset.y

		GLOBALS.stars.get('creep').find_path_goal_spawn();

		GLOBALS.signals.creepReachedGoal.add(this.loseLife, this)
		GLOBALS.signals.towerPlaced.add(this.loseGold, this)
		GLOBALS.signals.towerLeveled.add(this.loseGold, this)
		GLOBALS.signals.creepKilled.add(this.creepKilled, this)

		this.CollisionManager = CollisionManager()

		game.onFocus.add(()=>{
			// debugger
			// game.input.activePointer.dirty = true
			// game.input.pointers.forEach((p)=>{
			// 	console.log('p',p.position)
			// 	p.dirty = true
			// })
		})

		game.input.maxPointers = 1
		game.input.setInteractiveCandidateHandler((pointer, candidates, favorite)=>{
			for (var i = 0; i < candidates.length; i++)
			{
				if (candidates[i].sprite.key === 'tank')
				{
				    // return candidates[i];
				}
			}
			return favorite
		}, this)

		console.timeEnd('boot')
	}
	loseLife(){
		GLOBALS.player.life --

		if(GLOBALS.player.life <= 0){
			console.warn('you are dead')
			debugger
		}
	}
	loseGold(cost = 5){
		GLOBALS.player.gold -= cost
	}
	creepKilled(gold = 1){
		GLOBALS.player.gold += gold
		GLOBALS.player.score += (gold*GLOBALS.player.wave)
	}

	maskBoard (){
		let rect = {
			x: 0,
			y:16,
			width: GLOBALS.height * GLOBALS.tx,
			height: GLOBALS.width * GLOBALS.ty,
			objectToMask: this.groups.board,
			name: 'board'
		}
		let mask = buildBoundInputMask(rect)
		mask.parent.sendToBack(mask)
	}

	onClick (point, event){
		// this.brush.setTile.apply(this, arguments)
		// this.move_player.apply(this,arguments)
		GLOBALS.signals.paintWithBrush.dispatch()
	}

	move_player () {
		// console.log('mp', this.getPointFrom('mouse'))
		// this.signals.playerMove.dispatch(this.getPointFrom('mouse'))
	}
	update () {
		this.CollisionManager.collide()

		GLOBALS.groups.creeps.sort('y', Phaser.Group.SORT_ASCENDING);

		if(!game.input.activePointer.withinGame){
			GLOBALS.signals.outOfGame.dispatch()
		}
	}

	render(){
		try{
			game.bullets[0].children.forEach((b,i)=>{
				game.debug.body(game.bullets[0].children[i])
				// game.debug.bodyInfo(game.bullets[0].children[i], 0,20)
			})
		}catch(e){}
		try{
			GLOBALS.groups.creeps.children.forEach((b,i)=>{
				// game.debug.body(GLOBALS.groups.creeps.children[i])  
			})
			// game.debug.spriteInfo(game.bullets[0].children[0])
			
			// game.debug.spriteInfo(this.groups.board.children[5].children[0], 16,16)
			// game.debug.spriteBounds(towers[0].sprite)
			// game.debug.spriteInfo(towers[0].sprite, 16,16)
		}catch(e){}
		try{
			// game.debug.spriteBounds(this.bg, 'ff0000')
		}catch(e){}
		let life = GLOBALS.player.life
		let gold = GLOBALS.player.gold
		let duration = (GLOBALS.timers.firstWave.duration / 1000).toFixed(0)
		let score = GLOBALS.player.score
		let text = `life: ${life} gold: ${gold} score: ${score}`
		// t-: ${duration}
		game.debug.text(text,2,12)
		this.game.time.advancedTiming = true
		this.game.debug.text(this.game.time.fps || '--', 2, 280, "#000000")

		// let currentTower = GLOBALS.towerReferenceManager.getTower()
		// // console.log(currentTower)
		// if(currentTower != null){
		// 	let level = currentTower.level
		// 	let brush = currentTower.brush
		// 	let data = GLOBALS.towers.towers[brush]
		// 	let cost = data.cost[level] || 'max'
		// 	let power = data.damage[level-1]

		// 	this.game.debug.text(`level: ${level}`, 50, 250, "#000000")
		// 	this.game.debug.text(`next level cost: ${cost}`, 50, 270, "#000000")
		// 	this.game.debug.text(`current power: ${power}`, 50, 290, "#000000")
		// }
	}

	buildBG(){
		this.bg = game.make.graphics()
		this.bg.beginFill(0xff0000)
		this.bg.drawRect(0,0,config.gameWidth, config.gameHeight)
		this.bg.inputEnabled = true
		this.bg.hitArea = new Phaser.Rectangle(0, 0, config.gameWidth, config.gameHeight)
		this.bg.events.onInputDown.add(()=>{console.log('asdf');GLOBALS.signals.updateBrush.dispatch(null)})
		game.world.addChild(this.bg)
		game.world.sendToBack(this.bg)
	}

	buildDynamicGlobals(){
		const tempGLOBALS = {
			currentCollisionLayer: function(){
					let a  = []
					this.board.map.layers[1].data.forEach( function (array,i) {
						let subArray = []
						array.forEach((cell,i) => {
							subArray.push(Object.assign({},cell))
						})
						a.push(subArray)
					})
				return a
			}.bind(this),

			prefab_classes:  {
				"player": Player
			},

			signals: {},
			cursor: {
				towerActive: false
			}
		}

		let signalNames = ['creepPathReset', 'updateBrush', 'paintWithBrush',
											 'creepReachedGoal', 'waveStart', 'outOfGame', 'towerPlaced',
											 'towerLeveled','creepKilled', 'display', 'cursorActive'].forEach((name,i)=>{
													tempGLOBALS.signals[name] = new Phaser.Signal()                  
											 })


		Object.assign(GLOBALS, tempGLOBALS)

		window.GLOBALS = GLOBALS
	}
}