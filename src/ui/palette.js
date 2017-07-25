import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask, highLightableGroup } from '../utils'
import {FancyBrush} from './fancyBrush'
import GLOBALS from '../config/globals'

import Packer from '../ext/packer'

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
			let p = new Packer(12,20)
			p.fit(GLOBALS.fancySortedSizes)

			game.fancyBrushSprites = []
			let brushGroup = game.add.group()
			brushGroup.scale.setTo(.5,.5)
		    const th = GLOBALS.tH
			const tw = GLOBALS.tW

			brushGroup.x = tw*(GLOBALS.width + 1)
		    brushGroup.y = th

		    let w = {x: 0, y: 0}
			this.brushes.forEach((data,i)=>{
				
				// console.log(data.size)
				let fit = GLOBALS.fancySortedSizes[i].fit
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
						// console.log(sprite, sprite=='none')
						if(sprite == 'none'){
							return
						}
						group.addChild(game.make.sprite(x,y, 'ms', GLOBALS.brushMap[sprite]))
					}
				})
				group.updateHitArea()
				// console.log(GLOBALS.fancySortedSizes[i].fit)
				// console.log(fit)
				let tx = 0,ty = 0
				// if(fit.x == 0 && fit.y == 0){
				// 	console.log(1)
				// 	tx = 0
				// 	ty = 0
				// }else{
					ty = fit.y
					tx = fit.x
				// 	if(fit.x !== 0){
				// 		console.log(GLOBALS.fancySortedSizes[i-1].fit)
				// 		tx = fit.x + 1
				// 	}

				// 	if(fit.y !== 0){
				// 		ty = fit.y + 1
				// 	}
				// }
				// console.log(fit)
				// if(fit.y != 0){
				// 	ty = GLOBALS.fancySortedSizes[i-1].fit.down.y +1
				// }else{
				// 	ty = fit.y
				// }

				// if(fit.x != 0){
				// 	tx = GLOBALS.fancySortedSizes[i-1].fit.down.x +1
				// }else{
					// tx = fit.x
				// }
				// if(fit.y == 0){
				// 	console.log(2)
				// 	tx = GLOBALS.fancySortedSizes[i-1].fit.down.x +1
				// 	ty = 0
				// }else if(fit.x == 0){
				// 	console.log(3)
				// 	tx = 0
				// 	ty = GLOBALS.fancySortedSizes[i-1].fit.down.y +1
				// }else{
				// 	tx = GLOBALS.fancySortedSizes[i].fit.x +1
				// 	ty = GLOBALS.fancySortedSizes[i].fit.y +1
				// }
				// console.log('ww',tx,ty)
				// console.log(fit.x,fit.y)
				// console.log(fit)

				// if(fit.x == 0 && fit.y != 0){
				// 	// console.log('y', w.y)
				// 	w.y++
				// 	// w.x = 0
				// }

				// if(fit.y == 0 && fit.x != 0){
				// 	// console.log('x', w.x)
				// 	w.x++
				// 	w.y = 0
				// }
				// console.log('f', fit.x, fit.y)
				// console.log('w',w)
				group.x = (tx * tw)
				group.y = (ty * th)
				// console.log(group.x,group.y, this.gridWiggle*w.x)
				
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
	.init(function ({p,brushes,fancyBrush, xOffset,yOffset,gridWiggle}, {args, instance, stamp}) {
		Object.assign(instance,{
			brushes, fancyBrush, 
			xOffset, yOffset,
			gridWiggle: gridWiggle || 5
		})
		game.currentBrush = 26

		if(instance.fancyBrush){
			this.buildFancyBrushes()
		}else{
			this.build()
		}
	  })