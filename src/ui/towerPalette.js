import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask, highLightableGroup } from '../utils'
import {FancyBrush} from './fancyBrush'
import {MiniCursor, GroupManager} from './cursors'
import GLOBALS from '../config/globals'

let base = Stampit()
	.methods({
		build( ){
			let group = this.getGroup() || game.add.group()
		    let brushes = GLOBALS.towers.towers
		    // let brushes = [28,32,33,34, 46,24]
		    let tw,th,pW, l
		    l = brushes.length
		    tw = GLOBALS.tx
		    th = GLOBALS.ty
		    pW = 10

		    let g = game.make.graphics();
		    g.beginFill(0x666666);
		    g.drawRect(0, 0, 40,16);
		    group.addChild(g)

		    const res = [...Array(l)].map((_, i) => {
		    	let y = Math.floor(i/pW) * tw
		    	let x = (i%pW)* th
		    	let s = game.make.sprite(x,y, 'ms', brushes[i].index)
		    	s.inputEnabled = true
		    	s.events.onInputDown.add(this.setTower,this)
		    	s.events.onInputOver.add(this.setCursor,this)
		    	s.events.onInputOut.add(this.clearCursor,this)

		    	group.addChild(s)
		    	group.sendToBack(s)
			  return s;
			});

		    group.sendToBack(g)
		    group.x = tw*11+16
		    group.y = th*11

		    this.attach()

		    let rect = {
		      x: group.x,
		      y: group.y,
		      height: tw*pW,
		      width: th*(l+1/2),
		      objectToMask: group,
		      name: 'palette'
		    }
		},

		setTower(sprite, pointer){
			GLOBALS.signals.updateBrush.dispatch('tower', sprite._frame.index)
		},

		setCursor(sprite, pointer){
			let {x,y} = sprite.position
			let {width,height} = sprite.texture.frame
			this.updateCursor({x,y,width,height})
		}
	})

export const TowerPalette = base.compose(GroupManager, MiniCursor)