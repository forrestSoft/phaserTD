import stampit from 'stampit'

export const Cursor = Stampit()
	.methods({
		buildAndBind_cursor (){
			this.marker = game.add.graphics();
		    this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.drawRect(0, 0, 16,16);

		    game.input.addMoveCallback(this.updateMarker, this);
		},

		updateMarker() {
			let x,y
			x = (Math.floor(parent.game.input.activePointer.worldX/16))*16
			y = (Math.floor(parent.game.input.activePointer.worldY/16))*16
			this.marker.x = x
			this.marker.y = y

			this.sprite
			if(game.inputMasks.board.input.pointerOver()){
				if(!this.sprite){
					this.sprite = game.add.sprite(x,y, 'ms', game.currentBrush-1)
				}else{
					this.sprite.x = x
					this.sprite.y = y
				}
			}else{
				if(this.sprite){
					this.sprite.destroy()
					delete this.sprite
				}
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
		  	console.log('st', game.currentBrush)
			let {x,y} = game.input.activePointer

			this.map.putTile(game.currentBrush, this.baseLayer.getTileX(x-this.globalOffset.x),this.baseLayer.getTileY(y-this.globalOffset.y) , 'collision');
			this.pathfinding.setGrid(this.map.layers[1].data)
		  }
	})