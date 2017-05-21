import Phaser from 'phaser'
import _ from 'underscore'

import TowerSprite from '../prefabs/towerSprite'

import GLOBALS from '../config/globals'

export default class extends Phaser.Sprite {
	constructor ({x,y,key,frame,type,offset,level, signalOver, signalOut, doesInput}) {
		super(game,x,y,key,frame)
		this.data.type = type
		this.anchor.x = .5
		this.anchor.y = .5
		this.scale.setTo(.275,.45)
		this.level = level
		this.type = type
		this.offset = offset
		this.buildColorDot()
		this.signalOver = new Phaser.Signal()
		this.signalOut = new Phaser.Signal()
		this.isOver = false

		if(!doesInput){
			this.update = function(){}
		}else{
			this.update = _.throttle(this.update.bind(this), 250)
		}
	}
	update (){
		if(!this.input){
			return
		}

		if(this.input.pointerOver()){
			this.signalOver.dispatch()
		}else{
			this.signalOut.dispatch()
		}
	}
	buildColorDot(type, offset){
		// let dot = game.make.graphics()
		// dot.lineStyle(2, GLOBALS.towers.towers[type].tint, 1)
		// dot.drawCircle(offset.x,offset.y,4)
		// this.addChild(dot)
		var style = { 
			font: "90px Arial",
			fontWeight: 'bold',
			align: "center",
			fill:  `#${GLOBALS.towers.towers[this.type].tint}`
		}
		let textValue = (this.level || 'x')
		this.text = game.make.text(this.offset.x, this.offset.y, textValue, style);
		this.text.anchor.set(0.5);
		this.text.scale.setTo(.5,.25)
		this.addChild(this.text)
	}
	nextLevel(level){
		this.level = level
		this.text.destroy()
		this.buildColorDot()
	}
}