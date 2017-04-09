import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask } from '../utils'

export const Palette = Stampit()
	.methods({
		build( ){
			let group = game.add.group()
		    // let brushes = Array.from(new Array(50), (x,i) => i+1)
		    let brushes = [28,32,33,34, 46,24]
		    let tw,th,pW, l
		    l = brushes.length
		    tw = 16
		    th = 16
		    pW = 10

		    const res = [...Array(l)].map((_, i) => {
		    	let y = Math.floor(i/pW) * 16
		    	let x = (i%pW)* 16
		    	let s = game.make.sprite(x,y, 'ms', brushes[i])
		    	s.inputEnabled = true
		    	s.events.onInputDown.add(this.changeTile,this)
		    	group.addChild(s)
			  return s;
			});

		    group.x = 16*11
		    group.y = 16

		    let rect = {
		      x: group.x,
		      y: group.y,
		      height: tw*pW,
		      width: th*(l+1/2),
		      objectToMask: group,
		      name: 'palette'
		    }
		},
		changeTile(sprite, pointer){
			let index  = sprite._frame.index
			//something about tilemap and sprite indexes being off by 1?
			let brush = index+1

			// blank tile is a noop
			if(brush == 47){
				return
			}
			game.currentBrush = brush
		}
	})
	.init(function ({p}, {args, instance, stamp}) {
		game.currentBrush = 25
		this.build()
	  })