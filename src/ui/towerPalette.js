import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask, highLightableGroup } from '../utils'
import {FancyBrush} from './fancyBrush'
import {MiniCursor, GroupManager} from './cursors'
import TowerSprite from '../prefabs/towerSprite'
import GLOBALS from '../config/globals'

let base = Stampit()
	.methods({
		build( ){
			let group = this.getGroup() || game.add.group()
			let brushes = GLOBALS.towers.towers

			let tw,th,pW, l
			l = brushes.length
			tw = GLOBALS.tx
			th = GLOBALS.ty
			pW = 10

			let g = game.make.graphics();
			g.beginFill(0x666666);
			g.drawRect(0, 0, 16*Object.keys(brushes).length,16);
			group.addChild(g)

			const res = Object.keys(brushes).map((b, i) => {
				let y = Math.floor(i/pW) * tw + (GLOBALS.tW/2)
				let x = (i%pW)* th + (GLOBALS.tH/2)

				let s = new TowerSprite({
					x,y, 
					key:'tank',
					frame:'turret',
					type:b,
					offset:{ 
						x:-2, y:-1
					}
				})

				s.towerSprite.angle = brushes[b].displayAngle
				s.towerSprite.inputEnabled = true
				s.towerSprite.events.onInputDown.add(this.setTower,this)
				s.towerSprite.events.onInputOver.add(this.setCursor,this)
				s.towerSprite.events.onInputOut.add(this.clearCursor,this)

				group.addChild(s)
				group.sendToBack(s)

				return s
			});

			group.sendToBack(g)
			group.x = tw*11+16
			group.y = th*6

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
			GLOBALS.signals.updateBrush.dispatch('tower', sprite.parent.data.type)
		},

		setCursor(sprite, pointer){
			let {x,y} = sprite.parent.position
			let {tW:width,tH:height} = GLOBALS
			this.updateCursor({x:(x-GLOBALS.tW/2),y:y-(GLOBALS.tH/2),width,height})
		}
	})

export const TowerPalette = base.compose(GroupManager, MiniCursor)