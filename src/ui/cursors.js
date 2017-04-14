import stampit from 'stampit'
import Phaser from 'phaser'

export const Cursor = Stampit()
	.methods({
		buildAndBind_cursor (){
			this.marker = game.add.graphics();
		    this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.drawRect(0, 0, 16,16);

		    game.input.pollRate = 2
		    game.input.addMoveCallback(this.updateMarker, this);
		},

		updateMarker() {
			let x,y
			x = (Math.floor(parent.game.input.activePointer.worldX/16))*16
			y = (Math.floor(parent.game.input.activePointer.worldY/16))*16
			if(this.marker.x == x && this.marker.y == y){
				return
			}
			this.marker.x = x
			this.marker.y = y

			// this.sprite

			if(game.inputMasks.board.input.pointerOver()){
				// debugger
				if(!this.sprite){
				console.log(111)
					this.sprite = game.add.sprite(x,y, 'ms', game.currentBrush-1)
					// debugger
					this.sprite.alpha = .5
				}else{
					console.log(222)
					this.sprite.x = x
					this.sprite.y = y
				}

				this.position = {x:0,y:0}
				// console.log('p')
				this.p.pathfinding.find_path_from_brush(null,null, this.test, this);
			}else{
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
			// console.log('test',arguments)
		}
	})
	.init(function ({p}, {args, instance, stamp}) {
		instance.p = p

		this.buildAndBind_cursor()
	  })
	
export const Brush = Stampit()
	.methods({
		  setTile (sprite, pointer){
		  	console.log('st', game.currentBrush)
		  	if(!game.allowPaint){
		  		return
		  	}
			let {x,y} = game.input.activePointer
			
			this.map.putTile(game.currentBrush, this.baseLayer.getTileX(x-this.globalOffset.x),this.baseLayer.getTileY(y-this.globalOffset.y) , 'collision');
		  }
	})