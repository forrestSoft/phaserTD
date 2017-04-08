import stampit from 'stampit'

export const Cursor = Stampit()
	.methods({
		buildAndBind_cursor (){
			this.marker = game.add.graphics();
		    this.marker.lineStyle(2, 0xffffff, 1);
		    this.marker.drawRect(0, 0, 16,16);

		    this.p.game.input.addMoveCallback(this.updateMarker, this);
		},

		updateMarker() {
			this.marker.x = this.p.baseLayer.getTileX(parent.game.input.activePointer.worldX) * this.p.map.tileWidth;
			this.marker.y = this.p.baseLayer.getTileY(parent.game.input.activePointer.worldY) * this.p.map.tileHeight;
		}
	})
	.init(function ({p}, {args, instance, stamp}) {
		instance.p = p

		this.buildAndBind_cursor()

	  })
	.props({ // if nothing was passed this value will be used
		p: null
	});

export const Brush = Stampit()
	.methods({
		  nextBrushID (){
		    if(this.currentBrush < this.paints.length - 1){
		      this.currentBrush ++
		    }else{
		      this.currentBrush = 0
		    }
		    return this.paints[this.currentBrush]
		  },
		  setTile (sprite, pointer){
			let {x,y} = this.p.game.input.activePointer

			this.p.map.putTile(this.nextBrushID(), this.p.baseLayer.getTileX(x-this.p.globalOffset.x),this.p.baseLayer.getTileY(y-this.p.globalOffset.y) , 'collision');
			this.p.pathfinding.setGrid(this.p.map.layers[1].data)
		  }
	})
	.init(function ({p, paints}, {args, instance, stamp}) {
		instance.p = p
		instance.currentBrush = 0
		instance.paints = paints

		game.inputMasks.board.events.onInputDown.add(this.setTile, this);

	  })
	.props({ // if nothing was passed this value will be used
		p: null
	});

