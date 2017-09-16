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
import {Cursor} from '../ui/cursors'
import {Palette} from '../ui/palette'
import {TowerPalette} from '../ui/towerPalette'
import {Display} from '../ui/display'
import {CollisionManager} from '../engine/collisionManager'
import {DebugManager} from '../engine/phaserDebugger'

import GrowingPacker from '../ext/packer.growing'
import Packer from '../ext/packer'

import {App} from '../react/app.jsx' 

export default class extends base_level {
	init () {
		console.time('boot')

		this.buildDynamicGlobals()
		window.GLOBALS = window.G = GLOBALS
		GLOBALS.pd = DebugManager()

		this.level_data = this.cache.getJSON('level1');
		this.globalOffset = GLOBALS.globalOffset

		this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
		this.scale.setUserScale(2.5,2.5)
		// this.scale.pageAlignHorizontally = true;
		// this.scale.pageAlignVertically = true;
		
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.layers = {}
		this.groups = {
			board: this.game.add.group(undefined,'board'),
			cursor: this.game.add.group(undefined,'cursor'),
			towers: this.game.add.group(undefined,'towers')
		}
		this.groups.board.add(this.groups.towers)

		GLOBALS.groups = this.groups
		GLOBALS.splashes = []
		
		// this.groups.board.inputEnableChildren = true
		this.prefabs = {}
		// this.objects = {}

		this.board = Board({
			name: 'level1',
			mapData: this.level_data.map,
			groups: this.groups,
			layers:this.layers,
			state: this,
			objects: this.objects,
			levelData: this.level_data
		})

		// this.display = Display({
		// 	offset: {x:190, y: 130},
		// })

		this.map = this.board.buildMap()
		GLOBALS.boardGroup = this.groups.board

		this.initPathfinding()

		this.signals = {
			playerMove: new Phaser.Signal()
		}

		this.counters = {
			creepID: 0,
			splashID: 0
		}
	}
	initPathfinding(){
		let tileDimensions = new Phaser.Point(GLOBALS.tW, GLOBALS.tH)
		let stars = Pathfinders()
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
	}
	start(){
		GLOBALS.signals.waveStart.dispatch()
	}
	buildTimers(){
		G.timers = {
			firstWave: game.time.create(false)
		}

		this.game.time.advancedTiming = true

		GLOBALS.timers.firstWave.add(Phaser.Timer.SECOND * GLOBALS.waves.beforeBegin, this.start, this)
	}
	create () {
		GLOBALS.reactUI = this.reactUI = App()

		this.buildTimers()
		this.maskBoard()
		this.board.buildForCreate()
		game.inputMasks.board.events.onInputDown.add(this.onClick, this)

		Object.assign(this,{
			baseLayer: this.layers['background'],
			palette: Palette({ brushes: GLOBALS.fancyBrushes, fancyBrush: true}),
			towerPalette: TowerPalette().build(),
			cursor: Cursor({p:this, group: this.groups.cursor}),
			CollisionManager: CollisionManager()
			// palette2: Palette({ y: 0, x: 240}),
			// brush: Brush(),
		})

		this.groups.board.addChild(this.groups.towers)
		this.groups.board.addChild(this.groups.cursor)

		this.defineKeyHandlers()
		this.bindUIEvents()

		this.groups.board.y = this.globalOffset.y

		GLOBALS.stars.get('creep').find_path_goal_spawn();
		GLOBALS.timers.firstWave.start()

		// game.onFocus.add(()=>{})

		game.input.maxPointers = 1
		console.timeEnd('boot')
	}
	bindUIEvents(){
		let s = GLOBALS.signals

		s.creepReachedGoal.add(this.UIEvents.loseLife, this)
		s.creepKilled.add(this.UIEvents.creepKilled, this)
		
		s.towerPlaced.add(this.UIEvents.loseGold, this)
		s.towerLeveled.add(this.UIEvents.loseGold, this)
		s.tileLockToggle.add(this.UIEvents.tileLockToggle, this)
	}
	defineKeyHandlers (){
		this.keyHandlers = {}

		this.keyHandlers.r = game.input.keyboard.addKey(Phaser.Keyboard.R);
		this.keyHandlers.r.onDown.add((key)=>{
			GLOBALS.signals.rotate.dispatch()
		})

		this.keyHandlers.shift = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
		this.keyHandlers.shift.onDown.add((key)=>{
			GLOBALS.signals.tileLockToggle.dispatch()
		})
		this.keyHandlers.shift.onUp.add((key)=>{
			GLOBALS.signals.tileLockToggle.dispatch()
		})
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
		GLOBALS.signals.paintWithBrush.dispatch()
	}

	update () {
		this.CollisionManager.collide()

		GLOBALS.groups.creeps.sort('y', Phaser.Group.SORT_ASCENDING);

		if(!game.input.activePointer.withinGame){
			GLOBALS.signals.outOfGame.dispatch()
		}
	}

	render(){
		this.reactUI.setState({
			FPS: this.game.time.fps,
			timer: (GLOBALS.timers.firstWave.duration / 1000).toFixed(0)
		})

		let f = GLOBALS.pd.getFunctions()
		f.forEach(g => g())
	}

	// buildBG(){
	// 	this.bg = game.make.graphics()
	// 	this.bg.beginFill(0xff0000)
	// 	this.bg.drawRect(0,0,config.gameWidth, config.gameHeight)
	// 	this.bg.inputEnabled = true
	// 	this.bg.hitArea = new Phaser.Rectangle(0, 0, config.gameWidth, config.gameHeight)
	// 	this.bg.events.onInputDown.add(()=>{console.log('asdf');GLOBALS.signals.updateBrush.dispatch(null)})
	// 	game.world.addChild(this.bg)
	// 	game.world.sendToBack(this.bg)
	// }

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
			'towerLeveled','creepKilled', 'display', 'cursorActive',
			'rotate', 'tileLockToggle'].forEach((name,i)=>{
				tempGLOBALS.signals[name] = new Phaser.Signal()                  
			 })

		this.UIEvents = {
			tileLockToggle(){
				let tileLock = GLOBALS.player.ui.tileLock
				GLOBALS.player.ui.tileLock = (tileLock === 0 ? 1 : 0)
				this.reactUI.setState({tileLock: GLOBALS.player.ui.tileLock})
			},
			loseLife(){
				GLOBALS.player.life --
				this.reactUI.setState({life: GLOBALS.player.life})

				if(GLOBALS.player.life <= 0){
					console.warn('you are dead')
					debugger
				}
			},
			loseGold(cost = 5){
				GLOBALS.player.gold -= cost
				this.reactUI.setState({gold: GLOBALS.player.gold})
			},
			creepKilled(gold = 1){
				GLOBALS.player.gold += gold
				GLOBALS.player.score += Math.ceil(gold*GLOBALS.player.wave/12)
				this.reactUI.setState({
					gold: GLOBALS.player.gold,
					score: GLOBALS.player.score})
			}
		}

		Object.assign(GLOBALS, tempGLOBALS)
	}
}