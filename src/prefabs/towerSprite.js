import Phaser from 'phaser'

import TowerSprite from '../prefabs/towerSprite'

import GLOBALS from '../config/globals'

export default class extends Phaser.Sprite {
	constructor ({x,y,key,frame,type,offset,level}) {
		super(game,x,y,key,frame)
		this.data.type = type
		this.anchor.x = .5
		this.anchor.y = .5
		this.scale.setTo(.275,.45)
		this.level = level
		this.type = type
		this.offset = offset
		this.buildColorDot()
	}
	buildColorDot(type, offset){
		// let dot = game.make.graphics()
		// dot.lineStyle(2, GLOBALS.towers.towers[type].tint, 1)
		// dot.drawCircle(offset.x,offset.y,4)
		// this.addChild(dot)
		console.log('l',this.level)
		var style = { 
			font: "90px Arial",
			fontWeight: 'bold',
			align: "center",
			fill:  `#${GLOBALS.towers.towers[this.type].tint}`
		}
		this.text = game.make.text(this.offset.x, this.offset.y, this.level || 'x', style);
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