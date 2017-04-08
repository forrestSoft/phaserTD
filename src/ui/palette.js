import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask } from '../utils'

export const Palette = Stampit()
	.methods({
		build( ){
			let group = game.add.group()
		    let brushes = [1,2,3,4,5,6,7,8]
		    let tw,th,pW,ch, l
		    l = brushes.length
		    tw = 16
		    th = 16
		    pW = 2

		    const res = [...Array(9)].map((_, i) => {
		    	let y = Math.floor(i/pW) * 16
		    	let x = (i%pW)* 16
		    	let s = game.make.sprite(x,y, 'ms', brushes[i%l])
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
		    this.paletteMask = buildBoundInputMask(rect)
		},
		changeTile(sprite, pointer){
			// let t = this.map.getTileWorldXY(pointer.x,pointer.y, null,null,this.layer)
			console.log(222,sprite._frame.index, arguments)
		}
	})
	.init(function ({p}, {args, instance, stamp}) {
		// instance.p = p
		// console.log(game.cache.getJSON('palette'))
		this.build()

	  })
	.props({ // if nothing was passed this value will be used
		p: null
	});