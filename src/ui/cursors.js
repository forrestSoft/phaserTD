import stampit from 'stampit'
import Phaser from 'phaser'
import _ from 'underscore'
import { Points } from '../utils'
import { FancyBrush } from './fancyBrush'
import TowerSprite from '../prefabs/towerSprite'

import GLOBALS from '../config/globals'

export const Cursor = stampit()
	.methods({
		buildAndBind_cursor() {
			this.marker = game.make.graphics()
			this.group.add(this.marker)
			this.group.pivot.setTo(0,0)

			// game.input.pollRate = 2
			this.dataState = {
				cursor: {
					type: -1
				},
				valid: {
					path: -1,
					placement: -1
				},
				pos: {
					x: -1,
					y: -1
				},
				tile: {
					x: -1,
					y: -1
				}
			}
			this.cursorState = CursorState.compose(Brush)({
				tileMap: this.p.map,
				group: this.group,
				marker: this.marker,
				rotationHappened: this.rotationHappened,
				dataState: this.dataState
			})

			GLOBALS.signals.updateBrush.add(this.cursorState.setBrushType, this.cursorState)
			GLOBALS.signals.updateBrush.add(this.resetRotation, this)
			GLOBALS.signals.paintWithBrush.add(this.cursorState.paint, this.cursorState)
			// GLOBALS.signals.paintWithBrush.add(this.resetRotation, this)
			GLOBALS.signals.outOfGame.add(this.cursorState.hideCursor, this.cursorState)
			GLOBALS.signals.rotate.add(this.rotateHook, this)
		},
		resetRotation() {
			this.rotationFactor = 0
			this.cursorState.rotationFactor = 0
			this.group.angle = 0
		},
		rotateHook() {
			this.group.angle += 90
			if (this.rotationFactor == 3) {
				this.rotationFactor = 0
			} else {
				this.rotationFactor++
			}

			this.cursorState.rotationFactor = this.rotationFactor
			this.updateMarker(false)
			this.rotationHappened.dispatch()
		},
		smallRect() {
			this.marker.clear()
			this.marker.lineStyle(2, 0xffffff, 1)
			this.marker.alpha = 1
			this.marker.drawRect(0, 0, GLOBALS.tH, GLOBALS.tW)
			this.marker.position.setTo(-GLOBALS.tH/2, -GLOBALS.tW/2)
		},
		largeRect() {
			let size = GLOBALS.fancyBrushes[this.cursorState.currentBrush].size

			this.marker.clear()
			this.marker.lineStyle(2, 0xffffff, 1)
			this.marker.alpha = 1
			this.marker.drawRect(0, 0, size[0] * GLOBALS.tW, size[1] * GLOBALS.tH)
			this.marker.position.setTo(-size[0]* GLOBALS.tW/2, -size[1]*GLOBALS.tH/2)
		},
		events() {
			this.moveFunction = _.throttle(this.updateMarker.bind(this), 75)
			game.input.addMoveCallback(this.moveFunction, this)

			// game.inputMasks.board.events.onInputOver.add(a => console.log(a), this)
			this.rotationHappened = new Phaser.Signal()
			this.rotationHappened.add(() => {
				this.checkPath()
			}, this)
		},
		withInSameSquare({ x, y }) {
			let xN = Math.floor(x / 16)
			let yN = Math.floor(y / 16)
			let xO = Math.floor(this.oldPos.x / GLOBALS.tW)
			let yO = Math.floor(this.oldPos.y / GLOBALS.tH)

			return xN == xO && yN == yO
		},
		updateMarker(unforce = true) {
			if (game.input.hitTest(game.inputMasks.board, game.input.activePointer, new Phaser.Point())) {
				// let offset = ({ x, y } = game.inputMasks.board.getBounds())
				// let x = game.input.activePointer.worldX - offset.x
				// let y = game.input.activePointer.worldY - offset.y
				let x = game.input.activePointer.worldX
				let y = game.input.activePointer.worldY - 16

				if (this.withInSameSquare({ x, y })) {
					return
				}

				this.oldPos = { x, y }

				if (this.cursorState.getCursorType() == 'fancy') {
					this.largeRect()
				} else {
					this.smallRect()
				}

				let nextCursorPosition = this.cursorState.calculateCursorTile(x, y, this.group, this.rotationFactor,unforce)
				let validCursorType = ['fancy', 'simple'].includes(this.cursorState.getCursorType())


				if (!validCursorType) {
					return
				}

				// let { x, y } = nextCursorPosition
				this.checkPath(nextCursorPosition.x, nextCursorPosition.y)

				// if(this.rotationFactor !== r || this.rotationFactor == undefined){
				console.log('rrrrrr')
				// this.rotationFactor = r
				if(this.rotationFactor % 2 !== 0){
					// this.group.x = this.group.x - 8
					// this.group.y = this.group.y + 8
					// marker.x = marker.x - 8
				}else{
					// this.group.y = this.group.y + 8
					// this.group.x = this.group.x - 8
				}
			
			} else if (this.marker) {
				this.cursorState.setOutOfBounds(this.marker)
			}
		},
		checkPath(x = this.oldPos.x, y = this.oldPos.y) {
			let xP = x // - (GLOBALS.globalOffset.x)
			let yP = y // - (GLOBALS.globalOffset.y)

			this.position = { x: 0, y: 0 }
			this.findFunction(null, null, this.PathCalculated, this, xP, yP, this.rotationFactor)
		},
		_ff() {
			this.findFunction = _.debounce(
				GLOBALS.stars.get('cursor').find_path_from_brush.bind(GLOBALS.stars.get('cursor')),
				75
			)
		},
		PathCalculated(path) {
			// console.log('p',path)
			this.cursorState.setPathFail(!path)
			this.cursorState.checkValidPlacement()
			this.cursorState.setSpriteTint()
		}
	})
	.init(function({ p, group }, { args, instance, stamp }) {
		Object.assign(instance, {
			p,
			group,
			oldPos: [-1, -1],
			rotationFactor: 0
		})

		this._ff()

		this.events()
		this.buildAndBind_cursor()
	})

export const CursorState = stampit()
	.methods({
		setBrushType(type, i) {
			if (!this.modes.includes(type)) {
				console.warn('bad type', type)
			}

			this.rotationFactor = 0
			this.brushType = type

			if (i) {
				this.currentBrush = i
			}
		},
		setPlacementValidity(valid) {
			this.validPlacement = valid
		},
		setSprite(sprite) {
			if (sprite) {
				this.sprite = sprite
			} else {
				this.sprite = null
			}
		},
		getCursorType() {
			return this.brushType
		},
		hideCursor() {
			if (this.sprite) {
				this.sprite.destroy()
			}

			if (this.marker) {
				this.marker.clear()
			}

			GLOBALS.cursor.towerActive = false
		},
		setPathFail(fail) {
			if (fail) {
				this.pathFail = true
			} else {
				this.pathFail = false
			}
			this.setSpriteTint()
		},
		setSpriteTint() {
			if (!this.sprite) {
				return
			}

			let image = this.sprite.towerSprite || this.sprite
			if (this.validPlacement && !this.pathFail) {
				image.tint = 0xffffff
			} else if (this.validPlacement && this.brushType == 'tower') {
				image.tint = 0xffffff
			} else {
				image.tint = 0xff0000
			}
		},
		getTile(x, y) {
			let size = this.getBrushSize()
			let { tH, tW, globalOffset, height, width } = GLOBALS

			//snap to grid
			let xN = Math.floor(x / tH) * tH // - globalOffset.x
			let yN = Math.floor(y / tW) * tW // - globalOffset.y
			let point = { xN, yN }

			let cutOffX1 = tW
			let cutOffX = (width ) * tW - (size[0] + 1) * tW

			let cutOffY1 = tH
			let cutOffY = (height ) * tH - (size[1] + 1) * tH
			
			// use the above x/y, unless
			// - over the last/first row/col
			// then snap
			if (xN >= cutOffX) {
				xN = width * tH - (size[1] + 1 ) * tH
			} else if (xN <= globalOffset.x) {
				console.log(xN,yN)
				xN = tH + globalOffset.x
			}

			if (cutOffY <= yN) {
				yN = height * tW - (size[0] + 1 ) * tW
			} else if (yN <= globalOffset.y) {
				yN = tW
			}

			// account for drift
			// xN = xN - 8
			// yN = yN + 8
			let tile = {
				x: xN / 16 - 1, //(globalOffset.x / tW)
				y: yN / 16 - 1 //(globalOffset.y / tH)
			}

			Object.assign(this.dataState, {
				tile: tile,
				pos: { x: xN, y: yN }
			})

			return { point, tile }
		},
		calculateCursorTile(x, y, marker, r, force) {
			this.rotationFactor = r
			this.getTile(x, y)
			let s = this.dataState.pos
			let size = this.getBrushSize()
			// debugger
			marker.x = s.x + (size[0]*8)
			marker.y = s.y + (size[1]*8)

			this.checkValidPlacement()
			this.getSprite()
			this.setSpriteTint()
			console.log({ x: s.x, y: s.y }, this.getBrushSize())
			return { x: s.x, y: s.y }
		},
		getSprite() {
			if (!this.brushType) {
				if (this.sprite) {
					this.sprite.destroy()
					this.sprite = null
					GLOBALS.cursor.towerActive = false
				}
				return
			}

			if (this.brushType != this.lastBrushType && this.sprite) {
				this.sprite.destroy()
				this.sprite = null
				GLOBALS.cursor.towerActive = false
			}

			// let spriteOffsetX = this.x
			// let spriteOffsetY = this.y

			// if(this.brushType == 'tower'){
			// 	spriteOffsetX += 8
			// 	spriteOffsetY += 8
			// }

			if (this.sprite) {
				this.translateSprite()
			} else {
				let { x, y } = this.dataState.pos

				switch (this.brushType) {
					case 'tower':
					console.log('tower')
						this.lastBrushType = 'tower'
						let tower = GLOBALS.towers.towers[this.currentBrush]

						this.sprite = new TowerSprite({
							x,
							y,
							key: 'tank',
							frame: 'turret',
							type: this.currentBrush,
							offset: {
								x: 0,
								y: 0
							},
							angle: tower.displayAngle,
							doesRange: true
						})
						this.group.add(this.sprite)
						this.sprite.position.setTo(0,0)

						GLOBALS.cursor.towerActive = true
						break

					case 'fancy':
						let size = GLOBALS.fancyBrushes[this.currentBrush].size
						let texture = game.fancyBrushSprites[this.currentBrush].generateTexture()

						this.sprite = game.make.sprite(0, 0, texture, this.group)
						this.sprite.boundsPadding = 0
						// this.sprite.pivot.setTo(this.sprite.width * .5,this.sprite.height * .5)
						let aH = window.aH || .5
						let aW = window.aW || .5
						// debugger

						this.sprite.anchor.setTo(aH, aW)

						this.group.add(this.sprite)
						this.group.bringToTop(this.marker)
						this.translateSprite()

						this.lastBrushType = 'fancy'
						game.currentFancyBrush = this.currentBrush

						GLOBALS.cursor.towerActive = false
						break

					case 'simple':
						this.sprite = game.add.sprite(x, y, 'ms', this.currentBrush - 1)
						this.lastBrushType = 'basic'

						GLOBALS.cursor.towerActive = false
						break
				}

				this.sprite.alpha = 0.75

				// this.sprite.update= ()=>{
				// let s = this.sprite
				// Object.assign(this.sprite, this.dataState)
				// game.debug.spriteBounds(this.group)
				// debugger
				// this.checkValidPlacement()
				// this.setSpriteTint()
				// this.translateSprite()
				// }
			}
		},
		translateSprite() {
			console.log('tsp', this.rotationFactor)
			return
			let nX, nY
			if(this.rotationFactor % 2 !== 0){				
				nX = this.dataState.pos.x + 8
				nY = this.dataState.pos.x - 8
			}else{
				nX = this.dataState.pos.x - 8
				nY = this.dataState.pos.x + 8
			}
			Object.assign(this.sprite, {
				x: nX,
				y: nY
			})
			return
			Object.assign(this.sprite, {
				x: this.dataState.pos.x + this.marker.height / 2, // + this.x //+ 33
				y: this.dataState.pos.y + this.marker.width / 2 //+ 33
			})
		},
		getBrushSize() {
			if (this.brushType === 'fancy') {
				return GLOBALS.fancyBrushes[this.currentBrush].size
			} else {
				return [1, 1]
			}
		},
		checkValidPlacement() {
			let s = this.dataState
			let tileC = this.tileMap.getTile(Math.floor(s.tile.x + 1), Math.floor(s.tile.y + 1), 'collision', true).index
			let tileT = this.tileMap.getTile(Math.floor(s.tile.y), Math.floor(s.tile.y), 'towers', true).index
			let isTower = this.brushType == 'tower'
			let isTowerFoundation = GLOBALS.towerFoundation == tileC
			let isTileAcceptable = !GLOBALS.unacceptableTiles.includes(tileC - 1)

			let hasEnoughMoney
			let overExistingTower //=  game.input.activePointer.targetObject.sprite.key

			if (isTower) {
				overExistingTower =
					game.input.activePointer.targetObject &&
					game.input.activePointer.targetObject.sprite &&
					game.input.activePointer.targetObject.sprite.key == 'tank'
				hasEnoughMoney = GLOBALS.towers.towers[this.currentBrush].cost[0] <= GLOBALS.player.gold
			}

			let validPlacementTower = isTowerFoundation && isTower && hasEnoughMoney && !overExistingTower
			let validPlacementBrush = isTileAcceptable && !isTower && !this.pathFail
			this.validPlacement = validPlacementTower || validPlacementBrush
		},
		setOutOfBounds(marker) {
			if (this.sprite) {
				this.sprite.destroy()
				this.sprite = null
				this.lastBrushType = null
			}

			if (this.rangeIndicator) {
				this.rangeIndicator.clear()
			}
			marker.alpha = 0
			this.previous = { x: -1, y: -1 }

			GLOBALS.cursor.towerActive = false
		}
	})
	.init(function({ tileMap, marker, group, rotationHappened, dataState }, { args, instance, stamp }) {
		Object.assign(instance, {
			modes: ['basic', 'fancy', 'tower', null],
			previous: { x: 0, y: 0 },
			brushType: null,
			currentBrush: null,
			validPlacement: true,
			sprite: undefined,
			attachObj: game,
			tileMap: tileMap,
			spriteKey: 'ms',
			towerManager: GLOBALS.towerManager,
			rotationFactor: 0,
			marker: marker,
			group,
			rotationHappened,
			dataState,
			rotationFactor: 0
		})

		this.rotationHappened.add( () => {
			this.checkValidPlacement()
		}, this)
	})

export const Brush = stampit().methods({
	paint() {
		console.log('paint')
		if (!this.validPlacement) {
			return
		}

		let state = this.dataState
		if (this.sprite) {
			let { x, y } = game.input.activePointer
			let baseLayer = game.tileMapLayers['collision']

			let cursorTile = {
				x: baseLayer.getTileX(state.pos.x),
				y: baseLayer.getTileY(state.pos.y)
			}

			switch (this.brushType) {
				case 'tower':
					this.lastBrushType = 'tower'
					GLOBALS.towerManager.addTower({ x: state.pos.x, y: state.pos.y, brush: this.currentBrush, cursorTile })
					// this.sprite.destroy()
					break

				case 'fancy':
					let brushData = GLOBALS.fancyBrushes[game.currentFancyBrush]
					let newBrush = GLOBALS.rotateFancyBrush(game.currentFancyBrush, this.rotationFactor)
					this.rotationFactor = 0
					FancyBrush.brushSpriteLoop({
						vars: { pW: brushData.size[0], pH: brushData.size[1] },
						sprite: newBrush,
						command: ({ i, x, y, tX, tY }, sprite) => {
							// console.log(x,y,sprite)
							if (sprite == 'none') {
								return
							}

							this.tileMap.putTile(GLOBALS.brushMap[newBrush[i]] + 1, tX + cursorTile.x, tY + cursorTile.y, 'collision')
						}
					})
					GLOBALS.stars.get('creep').setGrid(this.tileMap.layers[1].data)
					GLOBALS.stars.get('creep').find_path_goal_spawn()

					break

				case 'simple':
					this.map.putTile(
						game.currentBrush,
						this.baseLayer.getTileX(x - this.globalOffset.x),
						this.baseLayer.getTileY(y - this.globalOffset.y),
						'collision'
					)

					GLOBALS.stars.get('creep').setGrid(this.tileMap.layers[1].data)
					GLOBALS.stars.get('creep').find_path_goal_spawn()
					break
			}

			this.checkValidPlacement()
			if (!GLOBALS.player.ui.tileLock) {
				this.brushType = null
			}
		}
	}
})

export const MiniCursor = stampit()
	.methods({
		buildCursor() {
			this.marker = game.add.graphics()
			this.getGroup().addChild(this.marker)
		},
		updateCursor({ x, y, width, height }) {
			this.marker.clear()
			this.marker.lineStyle(2, 0xfffccf, 1)
			this.marker.drawRect(x, y, height, width)
		},
		clearCursor() {
			this.marker.clear()
		}
	})
	.init(function({}, { args, instance, stamp }) {
		console.log('mini', args)
		this.buildCursor()
	})

export const GroupManager = stampit()
	.methods({
		getGroup() {
			if (!this.group) {
				this.group = game.make.group()
			}
			return this.group
		},
		attach() {
			game.stage.addChild(this.getGroup())
		}
	})
	.init(function({}, { args, instance, stamp }) {
		console.log('gman', args)
		instance.attachObj = game
	})
