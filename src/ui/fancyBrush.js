import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask, highLightableGroup } from '../utils'
import GLOBALS from '../config/globals'

export const FancyBrush = {
	brushSpriteLoop({sprite, vars, command}){
		const res = [...Array(Math.ceil(vars.pW*vars.pH))].map((_, i) => {
	    	let tY = Math.floor(i/vars.pW)
	    	let y = tY * GLOBALS.tW
	    	let tX = (i%vars.pW) 
	    	let x = tX * GLOBALS.tH

	    	command({x,y,tX, tY}, sprite[i])
		});

	},

	brushLoopFromSprite({sprite, vars, command}){
		sprite.every((spriteName, i) => {
			let tY = Math.floor(i/vars.pW)
	    	let y = tY * GLOBALS.tW
	    	let tX = (i%vars.pW) 
	    	let x = tX * GLOBALS.tH

	    	return command({x,y,tX, tY}, sprite[i])
		})
	}
}