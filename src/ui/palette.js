import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask, highLightableGroup } from '../utils'
import {FancyBrush} from './fancyBrush'
import GLOBALS from '../config/globals'

export const Palette = Stampit()
	.methods({
		build( ){
			let group = game.add.group()
		    let brushes = this.brushes
		    // let brushes = [28,32,33,34, 46,24]
		    let tw,th,pW, l
		    l = brushes.length
		    tw = GLOBALS.tx
		    th = GLOBALS.ty
		    pW = 10

		    const res = [...Array(l)].map((_, i) => {
		    	let y = Math.floor(i/pW) * tw
		    	let x = (i%pW)* th
		    	let s = game.make.sprite(x,y, 'ms', brushes[i])
		    	s.inputEnabled = true
		    	s.events.onInputDown.add(this.changeTile,this)
		    	group.addChild(s)
			  return s;
			});

		    group.x = tw*11 + this.xOffset
		    group.y = th + this.yOffset

		    let rect = {
		      x: group.x,
		      y: group.y,
		      height: tw*pW,
		      width: th*(l+1/2),
		      objectToMask: group,
		      name: 'palette'
		    }
		},

		buildFancyBrushes(){
			game.fancyBrushSprites = []
			let brushGroup = game.add.group()
			brushGroup.scale.setTo(.5,.5)
		    const th = GLOBALS.tH
			const tw = GLOBALS.tW

			brushGroup.x = tw*(GLOBALS.width + 1)
		    brushGroup.y = th

			this.brushes.forEach((data,i)=>{
				let group = new highLightableGroup({
					game: game, 
					parent: brushGroup, 
					name: `${i}`,
					size: data.size,
					isDownCallback: this.isDownCallBack,
					context: this
				})

				let pW = data.size[0]
				let pH = data.size[1]

				FancyBrush.brushSpriteLoop({
					vars: {pW,pH},
					sprite: data.sprite,
					command: ({x,y}, sprite) => {
						group.addChild(game.make.sprite(x,y, 'ms', GLOBALS.brushMap[sprite]))
					}
				})

				group.x = (i%pW)* (pW*th) + (i%pW*this.gridWiggle)
				group.y = Math.floor(i/pH)*(pH*tw) + (Math.floor(i/pH)*this.gridWiggle)
				game.fancyBrushSprites.push(group)
				brushGroup.addChild(group)
			})
		},
		isDownCallBack(brush){
			this.changeBrushFancy(brush)
			// debugger
		},
		changeBrushFancy(brush){
			GLOBALS.signals.updateBrush.dispatch('fancy', brush)
		},
		changeTile(sprite, pointer){
			let index  = sprite._frame.index
			//something about tilemap and sprite indexes being off by 1?
			let brush = index+1

			// blank tile is a noop
			if(brush == 47){
				return
			}

			GLOBALS.signals.updateBrush.dispatch(brush, 'wall')
		}
	})
	.init(function ({p}, {args, instance, stamp}) {
		game.currentBrush = 26
		instance.brushes = args[0].brushes || Array.from(new Array(50), (x,i) => i+1)
		instance.fancyBrush = args[0].fancyBrush || false
		instance.xOffset = args[0].x || 0
		instance.yOffset = args[0].y || 0
		instance.gridWiggle = args[0].gridWiggle || 5

		if(instance.fancyBrush){
			this.buildFancyBrushes()
		}else{
			this.build()
		}
	  })