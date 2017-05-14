import Phaser from 'phaser'

import TowerSprite from '../prefabs/towerSprite'

import GLOBALS from '../config/globals'

export default class extends Phaser.Sprite {
	constructor ({x,y,key,frame,type,offset}) {
        // console.log('1',game,x,y,key,frame,type)
        super(game,x,y,key,frame)
        this.data.type = type
        this.buildColorDot(type, offset)
        this.anchor.x = .5
    	this.anchor.y = .5
    	this.scale.setTo(.275,.45)
    }
    buildColorDot(type, offset){
		let dot = game.make.graphics()
		dot.lineStyle(2, GLOBALS.towers.towers[type].tint, 1)
		dot.drawCircle(offset.x,offset.y,4)
		this.addChild(dot)
	}
}