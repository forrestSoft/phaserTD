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

			let lastPass = {
				x: 0,
				y: 0
			}

			let lastUseableHeight = 0

			let brushesHeight = Math.ceil(GLOBALS.fancyBrushes.length / GLOBALS.brushesWidth)
			let bHeight = brushesHeight
			let bWidth = GLOBALS.brushesWidth
			let size = bHeight * bWidth - 2
			let a = [...Array(size)].forEach((nothing,i)=>{
				// console.log(i, (i%bWidth)+ Math.floor(i/bWidth)*bWidth)
				// console.log(i, Math.floor(i/bWidth), (i%bWidth), Math.floor(i/bWidth)*bWidth)
				let x = Math.floor(i/bWidth)
				let y = (i%bWidth)
				// console.log(x,y,'|', x-1,y,'|', x, y-1)
				if(i >= 3){
					// return
				}

				let data = this.brushes[i]

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
				console.log(data)
				FancyBrush.brushSpriteLoop({
					vars: {pW,pH},
					sprite: data.sprite,
					command: ({x,y}, sprite) => {
						group.addChild(game.make.sprite(x,y, 'ms', GLOBALS.brushMap[sprite]))
					}
				})

				let xP, yP
				if(x-1 == -1){
					console.log('first x')
					xP = 0
				}else{
					xP = 
				}
				if(y-1 == -1){
					console.log('first y')
				}
				console.log(i,'--',x,y)

				group.x = x
				group.y = y
				game.fancyBrushSprites.push(group)
				brushGroup.addChild(group)
				return
				// console.log(i)
				let b = [...Array(GLOBALS.brushesWidth)].forEach((nothing2,l)=>{
					let oneD = i*GLOBALS.brushesWidth+l
					if(oneD >= GLOBALS.fancyBrushes.length){
						return 
					}

					let data = this.brushes[oneD]
					console.log(i,l, i*GLOBALS.brushesWidth+l)

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
					console.log(data)
					FancyBrush.brushSpriteLoop({
						vars: {pW,pH},
						sprite: data.sprite,
						command: ({x,y}, sprite) => {
							group.addChild(game.make.sprite(x,y, 'ms', GLOBALS.brushMap[sprite]))
						}
					})
					let x = (oneD%pW) * (pW*th) + (oneD%pW*this.gridWiggle)
					let y  = Math.floor(oneD/pH)*(pH*tw) + (Math.floor(oneD/pH)*this.gridWiggle)
					// debugger

					group.x = x
					group.y = y
					game.fancyBrushSprites.push(group)
					brushGroup.addChild(group)
				})
			})
			this.brushes.forEach((data,i)=>{
				return
				console.log('--',i)
				// console.log(i, GLOBALS.brushesWidth, i%GLOBALS.brushesWidth)
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

				// if(i%GLOBALS.brushesWidth){
					// console.log('new row', (i%GLOBALS.brushesWidth))
				// }
				let isNewRow = (i%GLOBALS.brushesWidth) == 0
				if(isNewRow){
					// debugger/
					lastUseableHeight = lastPass.y //+ (th*pH) + (i%pH*this.gridWiggle)
					console.log('nr', lastUseableHeight, lastPass)
				}
				FancyBrush.brushSpriteLoop({
					vars: {pW,pH},
					sprite: data.sprite,
					command: ({x,y}, sprite) => {
						group.addChild(game.make.sprite(x,y, 'ms', GLOBALS.brushMap[sprite]))
					}
				})

				let x = (i%pW) * (pW*th) + (i%pW*this.gridWiggle)
				let y = lastPass.y + (Math.floor(i/pH)*this.gridWiggle)
				// debugger
				// console.log('lp',lastPass, x)
				if(isNewRow){
					// lastPass
				}
				lastPass = {
					x: x > lastPass.x ? x : lastPass.x,
					y: y + (pH*th) > lastPass.y ? y : lastPass.y
				}
				console.log(x,y)

				if((i%GLOBALS.brushesWidth)+3 == 5){
					console.log(33, lastUseableHeight, lastPass.y)
					lastUseableHeight += lastPass.y
				}
				// console.log(i,pW,th)
				// console.log(i,pH,tw)
				// debugger
				// console.log('--')
				group.x = x
				group.y = y
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