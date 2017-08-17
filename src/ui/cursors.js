import stampit from 'stampit'
import Phaser from 'phaser'
import _ from 'underscore'
import {Points} from '../utils'
import {FancyBrush} from './fancyBrush'
import TowerSprite from '../prefabs/towerSprite'

import GLOBALS from '../config/globals'

export const Cursor = stampit()
	.methods({
		buildAndBind_cursor (){
			this.container = game.make.group()
			this.group.add(this.container)
			this.marker = game.make.graphics()
			

		    this.container.add(this.marker)

		    //fix me !!!
		    // this.container.y = -16

		    // game.input.pollRate = 2
		    this.cursorState = CursorState.compose(Brush)({
		    	tileMap: this.p.map,
		    	container: this.container,
		    	group: this.group,
		    	marker: this.marker
		    })
		    
		    GLOBALS.signals.updateBrush.add(this.cursorState.setBrushType, this.cursorState)
		    GLOBALS.signals.paintWithBrush.add(this.cursorState.paint, this.cursorState)
		    GLOBALS.signals.outOfGame.add(this.cursorState.hideCursor, this.cursorState)
		    GLOBALS.signals.rotate.add(this.cursorState.rotate, this.cursorState)
		},
		smallRect(){
			this.marker.clear()
			this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.alpha = 1
			this.marker.drawRect(0,0,GLOBALS.tH,GLOBALS.tW)
		},
		largeRect(){
			let size = GLOBALS.fancyBrushes[this.cursorState.currentBrush].size
			// console.log(size)
			this.marker.clear()
			this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.alpha = 1
			this.marker.drawRect(0,0,size[0]*GLOBALS.tH,size[1]*GLOBALS.tW)
			this.cursorState.sprite.moveDown()
		},

		updateMarker() {
			let x,y

			if(game.input.hitTest(game.inputMasks.board, game.input.activePointer, new Phaser.Point())){
				// console.log(game.inputMasks.board.events.onInputOver)
				// debugger
				if(!this.marker){
					this.buildAndBind_cursor()
				}

				let x,y
				let offset = {x,y} = game.inputMasks.board.getBounds()
				x = game.input.activePointer.worldX - offset.x
				y = game.input.activePointer.worldY - offset.y


				let nextCursorPosition = this.cursorState.calculateCursorTile(x,y, this.marker)
				// console.log(nextCursorPosition)
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
					let xP = nextCursorPosition.x - (GLOBALS.globalOffset.x)
					let yP = nextCursorPosition.y - (GLOBALS.globalOffset.y)
					console.log('123432122',xP,nextCursorPosition.x/16,yP,nextCursorPosition.y/16)
					this.position = {x:0,y:0}
					this.findFunction(null,null, this.PathCalculated, this,xP,yP, this.cursorState.rotationFactor)
				}				
			}else if(this.marker){
				this.cursorState.setOutOfBounds(this.marker)
			}
		},

		_ff(){
			this.findFunction = _.debounce(GLOBALS.stars.get('cursor').find_path_from_brush.bind(GLOBALS.stars.get('cursor')), 75)
		},
		PathCalculated(path) {
			console.log('p',path)
			this.cursorState.setPathFail(!path)
			this.cursorState.checkValidPlacement()
			this.cursorState.setSpriteTint()
		}
	})
	.init(function ({p, group}, {args, instance, stamp}) {
		instance.p = p
		instance.group = group
		this._ff()
		game.input.addMoveCallback(this.updateMarker, this);
		// debugger
		game.inputMasks.board.events.onInputOver.add(a => console.log(a), this)
		this.buildAndBind_cursor()
	})

export const CursorState = stampit()
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
		hideCursor(){
			if(this.sprite){
				this.sprite.destroy()
			}

			if(this.marker){
				this.marker.clear()
			}

			GLOBALS.cursor.towerActive = false
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

			let image = this.sprite.towerSprite || this.sprite
			if(this.validPlacement && !this.pathFail){
				image.tint = 0xffffff
			}else if(this.validPlacement && this.brushType == 'tower'){
				image.tint = 0xffffff
			}else{
				image.tint = 0xff0000
			}
		},
		calculateCursorTile(x,y, marker){

			let size = this.getBrushSize()
			let  {tH, tW, globalOffset, height, width} = GLOBALS

			//snap to grid
			this.x = (Math.floor(x/ tH) * tH)// - globalOffset.x
			this.originalX = this.x
			this.y = (Math.floor(y/tW) * tW)// - globalOffset.y
			console.log('xy', (this.x/16), (this.y/16))
			this.originalY = this.y

			let cutOffY1 = (tH)
			let cutOffY = ((height + 1) * tH) - ((size[0]+1)*tH)
			let cutOffX1 = (tW)
			let cutOffX = ((width + 1) * tW) - ((size[0]+1)*tW)
			// console.log(cutOffX1, cutOffX, cutOffY1, cutOffY)
			// use the above x/y, unless
			// - over the last/first row/col
			// then snap
			// console.log(this.x,this.y, globalOffset)

			if(this.x >= cutOffX){
				console.log('123', width*tH, size[0]*tH, width*tH - size[0]*tH)
				this.x = width*tH - ((size[0])*tH)
			}else if(this.x <= globalOffset.x){
				this.x = tH + globalOffset.x
			}

			if(cutOffY <= this.y){
				this.y = height*tW - ((size[1]+1)*tW)
				console.log(333, height*tW, size[1]*tW, height*tW-size[1]*tH)
			}else if(this.y <= globalOffset.y){
				this.y = tW
			}

			this.tileX = (this.x/16) - 1//(globalOffset.x / tW)
			this.tileY = (this.y/16) - (globalOffset.y / tH)
			let compareX = (this.x+globalOffset.x)
			let compareY = (this.y+globalOffset.y)
			// console.log((this.x/16) ,globalOffset.x , tW)
			// debugger
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
				if(this.sprite){
					this.sprite.destroy()
					this.sprite = null
					GLOBALS.cursor.towerActive = false
				}
				return
			}

			if(this.brushType != this.lastBrushType && this.sprite){
				this.sprite.destroy()
				this.sprite = null
				GLOBALS.cursor.towerActive = false
			}

			let spriteOffsetX = this.x
			let spriteOffsetY = this.y

			if(this.brushType == 'tower'){
				spriteOffsetX += 8
				spriteOffsetY += 8
			}

			if(!!this.sprite){
				this.translateSprite()
			}else{
				switch (this.brushType){
					case 'tower':
						this.lastBrushType = 'tower'
						let tower = GLOBALS.towers.towers[this.currentBrush]

						this.sprite = new TowerSprite({
							x: this.x,
							y: this.y, 
							key:'tank',
							frame:'turret',
							type: this.currentBrush,
							offset:{ 
								x:0, y:0
							},
							angle: tower.displayAngle,
							doesRange: true
						})
						this.container.add(this.sprite)

						GLOBALS.cursor.towerActive = true
						break

					case 'fancy':
						// debugger
						// console.log('qwe',this.marker.height, this.marker.width)
						this.sprite = game.make.sprite( this.x, this.y ,game.fancyBrushSprites[this.currentBrush].generateTexture(), this.group)
						this.sprite.boundsPadding = 0
						// this.sprite.pivot.setTo(this.sprite.width * .5,this.sprite.height * .5)
						this.sprite.anchor.setTo(.5,.5)
						
						this.translateSprite()
						this.container.add(this.sprite)
						this.sprite.alpha = 1

						this.lastBrushType = 'fancy'
						game.currentFancyBrush = this.currentBrush

						GLOBALS.cursor.towerActive = false
						break

					case 'simple':	
						this.sprite = game.add.sprite(this.x,this.y, 'ms', this.currentBrush-1)
						this.lastBrushType = 'basic'

						GLOBALS.cursor.towerActive = false
						break
				}

				this.sprite.alpha = .75

				this.sprite.update= ()=>{
					game.debug.spriteBounds(this.group)
					this.checkValidPlacement()
					this.setSpriteTint()
					this.translateSprite()
				}
			}
		},
		translateSprite(){
			this.sprite.x = this.x + this.marker.height/2  // + this.x //+ 33
			this.sprite.y = this.y + this.marker.width/2 //+ 33
		},
		rotate(){
			this.sprite.angle += 90
			if(this.rotationFactor == 3){
				this.rotationFactor = 0
			}else{
				this.rotationFactor++
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
			// console.log(this.tileX, this.tileY)
			let tileC = this.tileMap.getTile(this.tileX+1,this.tileY+1,'collision', true).index
			let tileT = this.tileMap.getTile(this.tileX,this.tileY,'towers', true).index
			let isTower = this.brushType == 'tower'
			let isTowerFoundation = (GLOBALS.towerFoundation == tileC)
			let isTileAcceptable = !GLOBALS.unacceptableTiles.includes(tileC-1)

			let hasEnoughMoney
			let overExistingTower //=  game.input.activePointer.targetObject.sprite.key

			if(isTower){
				overExistingTower = game.input.activePointer.targetObject &&
									game.input.activePointer.targetObject.sprite &&
									game.input.activePointer.targetObject.sprite.key == 'tank'
				hasEnoughMoney = GLOBALS.towers.towers[this.currentBrush].cost[0] <= GLOBALS.player.gold
			}

			let validPlacementTower = (isTowerFoundation && isTower && hasEnoughMoney && !overExistingTower)
			let validPlacementBrush = (isTileAcceptable && !isTower && !this.pathFail)
			this.validPlacement = validPlacementTower || validPlacementBrush
		},
		setOutOfBounds(marker){
			if(this.sprite){
				this.sprite.destroy()
				this.sprite = null
				this.lastBrushType = null
			}

			if(this.rangeIndicator){
				this.rangeIndicator.clear()
			}
			marker.alpha = 0
			this.previous = {x: -1, y: -1}

			GLOBALS.cursor.towerActive = false
		}
	})
	.init(function ({tileMap, container, marker, group}, {args, instance, stamp}) {
		Object.assign(instance, {
			container: container,
			modes: ['basic', 'fancy', 'tower', null],
			previous: {x: 0, y: 0},
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
			group
		})
	})

export const Brush = stampit()
	.methods({
		  paint(){
		  	console.log('paint')
		  	if(!this.validPlacement){
		  		return
		  	}
			if(this.sprite){
				let {x,y} = game.input.activePointer
				let baseLayer = game.tileMapLayers['collision']
				
				let cursorTile = {
					x: baseLayer.getTileX(this.x),
					y: baseLayer.getTileY(this.y)
				}
				switch (this.brushType){
					case 'tower':
						this.lastBrushType = 'tower'
						GLOBALS.towerManager.addTower({x: this.x, y: this.y, brush: this.currentBrush, cursorTile})
						// this.sprite.destroy()
						break

					case 'fancy':
						let brushData = GLOBALS.fancyBrushes[game.currentFancyBrush]
						let newBrush = GLOBALS.rotateFancyBrush(game.currentFancyBrush, this.rotationFactor)
						this.rotationFactor = 0
						FancyBrush.brushSpriteLoop({
							vars: {pW: brushData.size[0],pH: brushData.size[1]},
							sprite: newBrush,
							command: ({i,x,y,tX,tY},sprite) => {
								if(sprite == 'none'){
									return
								}
								// console.log(GLOBALS.brushMap[newBrush[i]])
								this.tileMap.putTile(GLOBALS.brushMap[newBrush[i]]+1, tX+cursorTile.x,tY+cursorTile.y , 'collision');
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
				this.checkValidPlacement()
				if(!GLOBALS.player.ui.tileLock){
					this.brushType = null
				}
			}
		}
	})

export const MiniCursor = stampit()
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

export const GroupManager = stampit()
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