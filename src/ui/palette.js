import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask, highLightableGroup } from '../utils'

export const Palette = Stampit()
	.methods({
		build( ){
			if(this.fancyBrush){
				this.buildFancyBrushes()
				return
			}

			let group = game.add.group()
		    let brushes = this.brushes
		    // let brushes = [28,32,33,34, 46,24]
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

		buildFancyBrushes(){
			let brushGroup = game.add.group()
			// game.add(brushGroup)
			brushGroup.x = 16*12
		    brushGroup.y = 16

			const tw = 16
		    const th = 16
			this.brushes.forEach((data,i)=>{
				console.log(data,i)
				let group = new highLightableGroup({
					game: game, 
					parent: brushGroup, 
					name: `${i}`,
					size: data.size
				})

				let pW = data.size[0]
				let pH = data.size[1]

				const res = [...Array(data.size[0]*data.size[1])].map((_, l) => {
			    	let y = Math.floor(l/pW) * tw
			    	let x = (l%pW)* th
			    	let s = game.make.sprite(x,y, 'ms', data.sprite[l])
			    	// s.inputEnabled = true
			    	group.addChild(s)
					return s;
				});

				group.x = 16*pW*i + i*5
				group.y = 0
				console.log(group.marker)
				// group.marker.bringToTop()
				console.log(group.children)
				brushGroup.addChild(group)

				let name = `palette_brush${i}`
				let rect = {
			      x: brushGroup.x,
			      y: brushGroup.y,
			      height: tw*pW,
			      width: th*(pW+1/2),
			      objectToMask: group,
			      name: name
			    }
			    // buildBoundInputMask(rect)
			    console.log(game.inputMasks[name])


			})

		    // debugger
		},

		test(sprite, pointer){ 
			
			// console.log(sprite.parent)
			if(game.input.hitTest(sprite.parent, game.input.activePointer, new Phaser.Point())){
				sprite.parent._hasHighlight = true
			}else{
				sprite.parent._hasHighlight = false
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
		console.log(args)
		instance.brushes = args[0].brushes || Array.from(new Array(50), (x,i) => i+1)
		instance.fancyBrush = args[0].fancyBrush || false
		this.build()
	  })