import stampit from 'stampit'
import Phaser from 'phaser'

import {Points} from '../utils'

import GLOBALS from '../config/globals'

export const Cursor = Stampit()
	.methods({
		buildAndBind_cursor (){
			this.marker = game.add.graphics();
		    this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.alpha = 0
		    this.marker.drawRect(0, 0, 16,16);

		    game.input.pollRate = 2
		    game.input.addMoveCallback(this.updateMarker, this);
		},

		updateMarker() {
			let x,y

			if(game.input.hitTest(game.inputMasks.board, game.input.activePointer, new Phaser.Point())){
				x = (Math.floor(parent.game.input.activePointer.worldX/16))*16
				y = (Math.floor(parent.game.input.activePointer.worldY/16))*16
				
				if(this.marker.x == x && this.marker.y == y){
					return
				}
				this.marker.x = x
				this.marker.y = y
				this.marker.alpha = 1

				if(!this.sprite){
					this.sprite = game.add.sprite(x,y, 'ms', game.currentBrush-1)
					this.sprite.alpha = .75
				}else{
					this.sprite.x = x
					this.sprite.y = y
				}

				this.position = {x:0,y:0}
				GLOBALS.stars.get('cursor').find_path_from_brush(null,null, this.test, this);
			}else{
				this.marker.alpha = 0

				if(this.sprite){
					this.sprite.destroy()
					delete this.sprite
				}
			}
		},
		test (path) {
			if(path){
				game.allowPaint = true
				this.sprite.tint = 0xffffff
			}else{
				game.allowPaint = false
				this.sprite.tint = 0xff0000
			}
		}
	})
	.init(function ({p}, {args, instance, stamp}) {
		instance.p = p

		this.buildAndBind_cursor()
	  })
	
export const Brush = Stampit()
	.methods({
		  setTile (sprite, pointer){
		  	if(!game.allowPaint){
		  		return
		  	}
			let {x,y} = game.input.activePointer
			console.log((game.currentBrush, this.baseLayer.getTileX(x-this.globalOffset.x),this.baseLayer.getTileY(y-this.globalOffset.y) , 'collision'))
			this.map.putTile(game.currentBrush, this.baseLayer.getTileX(x-this.globalOffset.x),this.baseLayer.getTileY(y-this.globalOffset.y) , 'collision');
			GLOBALS.stars.get('creep').setGrid(this.map.layers[1].data)
			GLOBALS.stars.get('creep').find_path_goal_spawn()
		  }
	})