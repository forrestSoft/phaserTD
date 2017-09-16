import Phaser from 'phaser'
import _ from 'underscore'

import TowerSprite from '../prefabs/towerSprite'

import GLOBALS from '../config/globals'

export default class extends Phaser.Group {
	constructor ({x,y,key,frame,type,offset,level, signalOver, signalOut, doesInput, doesRange}) {
		super(game, null, 'tower', false, false, 0)

		this.data = {
			type, level, offset, doesInput, doesRange,
			isOver: false,
			tower: GLOBALS.towers.data(type)
		}

		this.inputEnableChildren = true

		this.buildSprite()
		this.buildColorDot()

		if(this.data.doesRange){
			this.buildRangeIndicator()
		}

		Object.assign(this, {x,y})

		if(doesInput){
			this.towerSprite.inputEnabled = true
			this.signalOver = this.towerSprite.events.onInputOver//new Phaser.Signal()
			this.signalOver.add(this.showRange, this)
			this.signalOut = this.towerSprite.events.onInputOut//new Phaser.Signal()
			this.signalOut.add(this.hideRange, this)
			// this.update = _.throttle(this.update.bind(this), 250)

			// something about the Phaser.Pointer object changing after window.focusLoss/focus
			// which would cause cursors to lose events. or something
			this.towerSprite.input.resetLocked = true //super fucking important
		}

		this.lastOverState = false
	}
	clearLastOver(){
		this.lastOverState = null
	}
	buildSprite(){
		this.towerSprite = game.make.sprite(0,0,'tank', 'turret')
		this.towerSprite.anchor.x = .5
		this.towerSprite.anchor.y = .5
		this.towerSprite.scale.setTo(.275, .45)
		this.data.realTower = true
		this.data.towerType = this.data.tower.index

		this.data.cost = GLOBALS.towers.data(this.data.towerType).cost[0]
		this.addChild(this.towerSprite)
	}
	buildColorDot(type, offset){
		var style = { 
			font: "90px Arial",
			fontWeight: 'bold',
			align: "center",
			fill:  `#${this.data.tower.tint}`
		}
		let textValue = (this.data.level || 'x')
		this.text = game.make.text(this.data.offset.x, this.data.offset.y, textValue, style)
		this.text.anchor.set(0.5);
		this.text.scale.setTo(.125,.125)
		this.addChild(this.text)
	}
	buildRangeIndicator(){
		this.rangeIndicator = game.make.graphics()
		this.rangeIndicator.lineStyle(2, 0x00ffff, 1)
		this.rangeIndicator.drawCircle(this.towerSprite.x,this.towerSprite.y,this.data.tower.rangeRadius*2)
		this.addChild(this.rangeIndicator)
	}
	hideRange(){
		this.rangeIndicator && (this.rangeIndicator.alpha = 0)
	}
	showRange(){
		this.rangeIndicator && (this.rangeIndicator.alpha = 1)
	}
	nextLevel(level){
		this.data.level = level
		this.text.destroy()
		this.buildColorDot()
	}
}