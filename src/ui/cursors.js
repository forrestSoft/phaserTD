import stampit from 'stampit'
import Phaser from 'phaser'
import _ from 'underscore'
import {Points} from '../utils'
import {FancyBrush} from './fancyBrush'
import {TowerManager} from '../prefabs/tower'

import GLOBALS from '../config/globals'

export const Cursor = Stampit()
	.methods({
		buildAndBind_cursor (){
			this.container = game.make.group()
			this.group.add(this.container)
			this.marker = game.make.graphics();
		    this.smallRect()
		    this.container.add(this.marker)

		    //fix me !!!
		    this.container.y = -16

		    game.input.pollRate = 2
		    this.cursorState = CursorState.compose(Brush)({
		    	tileMap: this.p.map,
		    	container: this.container
		    })
		    game.input.addMoveCallback(this.updateMarker, this);

		    GLOBALS.signals.updateBrush.add(this.cursorState.setBrushType, this.cursorState)
		    GLOBALS.signals.paintWithBrush.add(this.cursorState.paint, this.cursorState)
		},
		smallRect(){
			this.marker.clear()
			this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.alpha = 1
			this.marker.drawRect(0,0,16,16)
		},
		largeRect(){
			let size = GLOBALS.fancyBrushes[this.cursorState.currentBrush].size

			this.marker.clear()
			this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.alpha = 1
			this.marker.drawRect(0,0,size[0]*GLOBALS.tH,size[1]*GLOBALS.tW)
			this.cursorState.sprite.moveDown()
		},

		updateMarker() {
			let x,y

			if(game.input.hitTest(game.inputMasks.board, game.input.activePointer, new Phaser.Point())){
				let x,y
				x = game.input.activePointer.worldX
				y = game.input.activePointer.worldY

				let nextCursorPosition = this.cursorState.calculateCursorTile(x,y, this.marker)
				
				if(nextCursorPosition === null){
					return
				}

				if(this.cursorState.getCursorType() == 'fancy'){
					this.largeRect()
				}else{
					this.smallRect()
				}
				
				let validCursorType = ['fancy', 'simple'].includes(this.cursorState.getCursorType())
				this.cursorState.checkValidPlacement()
				if(validCursorType){
					this.position = {x:0,y:0}
					this.findFunction(null,null, this.PathCalculated, this,nextCursorPosition.x,nextCursorPosition.y)
				}				
			}else{
				this.cursorState.setOutOfBounds(this.marker)
			}
		},

		_ff(){
			this.findFunction = _.debounce(GLOBALS.stars.get('cursor').find_path_from_brush.bind(GLOBALS.stars.get('cursor')), 75)
		},
		PathCalculated(path) {
			this.cursorState.setPathFail(!path)
			this.cursorState.checkValidPlacement()
			this.cursorState.setSpriteTint()
		}
	})
	.init(function ({p, group}, {args, instance, stamp}) {
		instance.p = p
		instance.group = group
		this._ff()
		this.buildAndBind_cursor()
	})


export const CursorState = Stampit()
	.methods({
		setBrushType(type, i){
			if(!this.modes.includes(type)){
				console.warn('bad type', type)
			}

			this.brushType = type

			if(i){
				this.currentBrush = i
			}
		},
		setPlacementValidity(valid){
			this.validPlacement = valid
		},
		setSprite(sprite){
			if(sprite){
				this.sprite = sprite
			}else{
				this.sprite = null
			}
		},
		getCursorType(){
			return this.brushType
		},
		setPathFail(fail){
			if(fail){
				this.pathFail = true
			}else{
				this.pathFail = false
			}
			this.setSpriteTint()
		},
		setSpriteTint(){
			if(!this.sprite){
				return
			}
			
			if(this.validPlacement && !this.pathFail){
				this.sprite.tint = 0xffffff
			}else if(this.validPlacement && this.brushType == 'tower'){
				this.sprite.tint = 0xffffff
			}else{
				this.sprite.tint = 0xff0000
			}
		},
		calculateCursorTile(x,y, marker){

			let size = this.getBrushSize()
			let  {tH, tW, globalOffset, height, width} = GLOBALS

			//snap to grid
			this.x = (Math.floor(x/ tH)) * tH
			this.originalX = this.x
			this.y = (Math.floor(y/tW)) * tW
			this.originalY = this.y

			let cutOffX = ((height + 1) * tH) - ((size[0]+1)*tH)
			let cutOffY = ((width + 1) * tW) - ((size[0]+1)*tW)

			if(cutOffX <= this.x){
				this.x = height*tH - ((size[0]+1)*tH)
			}else if(this.x == globalOffset.x){
				this.x = tH + globalOffset.x
			}

			if(cutOffY <= this.y){
				this.y = width*tW - ((size[1])*tW)
			}else if(this.y == globalOffset.y){
				this.y = tW + globalOffset.y
			}

			this.tileX = (this.x/16) - (globalOffset.x / tW)
			this.tileY = (this.y/16) - (globalOffset.y / tH)
			let compareX = (this.x+globalOffset.x)
			let compareY = (this.y+globalOffset.y)
			
			if((this.previous.x == compareX && this.previous.y == compareY)){
				this.previous.x == compareX
				this.previous.y == compareY
				return null
			}else{
				this.previous.x = compareX
				this.previous.y = compareY
				marker.x = this.x
				marker.y = this.y
				marker.alpha = 1
			}

			this.checkValidPlacement()
			this.getSprite()
			this.setSpriteTint()

			return {x: this.x, y: this.y, tileX: this.tileX, tileY: this.tileY}
		},
		getSprite(){
			if(!this.brushType){
				return
			}

			if(this.brushType != this.lastBrushType && this.sprite){
				this.sprite.destroy()
				this.sprite = null
			}

			if(!!this.sprite){
				this.sprite.x = this.x
				this.sprite.y = this.y
			}else{
				switch (this.brushType){
					case 'tower':
					console.log('t')
						this.lastBrushType = 'tower'
						this.sprite = game.make.sprite(this.x,this.y, 'ms', this.currentBrush)
						this.container.add(this.sprite)
						break

					case 'fancy':
						this.sprite = game.make.sprite(this.x,this.y,game.fancyBrushSprites[this.currentBrush].generateTexture())
						this.container.add(this.sprite)
						
						this.lastBrushType = 'fancy'
						game.currentFancyBrush = this.currentBrush
						break

					case 'simple':	
						this.sprite = game.add.sprite(this.x,this.y, 'ms', this.currentBrush-1)
						this.lastBrushType = 'basic'
						break
				}

				this.sprite.alpha = .75
			}
		},
		getBrushSize(){
			if(this.brushType === 'fancy'){
				return GLOBALS.fancyBrushes[this.currentBrush].size
			}else{
				return [1,1]
			}
		},
		checkValidPlacement(){
			let tileC = this.tileMap.getTile(this.tileX,this.tileY,'collision', true).index
			let tileT = this.tileMap.getTile(this.tileX,this.tileY,'towers', true).index

			let isTower = this.brushType == 'tower'
			let isTowerFoundation = (GLOBALS.towerFoundation == tileC)
			let isTileAcceptable = !GLOBALS.unacceptableTiles.includes(tileC-1)

			this.validPlacement =  (isTowerFoundation && isTower) || 
								   (isTileAcceptable && !isTower && !this.pathFail)
		},
		setOutOfBounds(marker){
			if(this.sprite){
				this.sprite.destroy()
				this.sprite = null
				this.lastBrushType = null
			}
			marker.alpha = 0
			this.previous = {x: -1, y: -1}
		}
	})
	.init(function ({tileMap, container}, {args, instance, stamp}) {
		instance.container = container
		instance.modes = ['basic', 'fancy', 'tower']
		instance.previous = {x: 0, y: 0}
		instance.brushType = 'simple'
		instance.currentBrush = 26
		instance.validPlacement = true
		instance.sprite = undefined
		instance.attachObj = game
		instance.tileMap = tileMap
		instance.spriteKey = 'ms'

		window.c = container
	})

export const Brush = Stampit()
	.methods({
		  paint(){
		  	console.log('paint')
		  	// this.checkValidPlacement()
		  	if(!this.validPlacement){
		  		return
		  	}
			if(this.sprite){
				let {x,y} = game.input.activePointer
				let baseLayer = game.tileMapLayers['collision']
				
				let cursorTile = {
					x: baseLayer.getTileX(this.x-GLOBALS.globalOffset.x),
					y: baseLayer.getTileY(this.y-GLOBALS.globalOffset.y)
				}
				switch (this.brushType){
					case 'tower':
						this.lastBrushType = 'tower'

						if(!this.towerManager){
							this.towerManager = TowerManager()
						}
						
						this.towerManager.addTower({x: this.x, y: this.y, brush: this.currentBrush})
						break

					case 'fancy':
						let brushData = GLOBALS.fancyBrushes[game.currentFancyBrush]

						FancyBrush.brushSpriteLoop({
							vars: {pW: brushData.size[0],pH: brushData.size[1]},
							sprite: brushData.sprite,
							command: ({x,y,tX,tY},sprite) => {
								this.tileMap.putTile(GLOBALS.brushMap[sprite]+1, tX+cursorTile.x,tY+cursorTile.y , 'collision');
							}
						})
						GLOBALS.stars.get('creep').setGrid(this.tileMap.layers[1].data)
						GLOBALS.stars.get('creep').find_path_goal_spawn()	
						break

					case 'simple':	
						this.map.putTile(game.currentBrush, this.baseLayer.getTileX(x-this.globalOffset.x),this.baseLayer.getTileY(y-this.globalOffset.y) , 'collision');
						GLOBALS.stars.get('creep').setGrid(this.tileMap.layers[1].data)
						GLOBALS.stars.get('creep').find_path_goal_spawn()	
						break
				}
				
			}
		}
	})

	
export const MiniCursor = Stampit()
	.methods({
		buildCursor(){
			this.marker = game.add.graphics();
		    this.getGroup().addChild(this.marker)
		},
		updateCursor({x,y,width,height}){
			this.marker.clear()
			this.marker.lineStyle(2, 0xfffccf, 1);
			this.marker.drawRect(x, y, height,width);
		},
		clearCursor(){
			this.marker.clear()
		}
	})
	.init(function ({}, {args, instance, stamp}) {
		console.log('mini', args)
		this.buildCursor()

	})

export const GroupManager = Stampit()
	.methods({
		getGroup(){
			if(!this.group){
				this.group = game.make.group()
			}
			return this.group
		},
		attach(){
			game.stage.addChild(this.getGroup())
		}
	})
	.init(function ({}, {args, instance, stamp}) {
		console.log('gman', args)
		instance.attachObj = game
	})