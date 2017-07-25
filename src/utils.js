import _ from 'underscore'
import GLOBALS from './config/globals'
export const centerGameObjects = (objects) => {
  objects.forEach(function (object) {
    object.anchor.setTo(0.5)
  })
}

export const buildBoundInputMask = ({x,y,height,width, objectToMask, name}) => {
	if(!game.inputMasks){
		game.inputMasks = {}
	}
    let rect, mask
    mask = game.add.graphics(0, 0);
    mask.beginFill(0xffffff);

    mask.inputEnabled = true
    mask.drawRect(x, y, height,width)
    objectToMask.mask = mask

    game.inputMasks[name] = mask
    return mask
}

export const Points = {
    tile_dimensions: {
        x: GLOBALS.tx,
        y: GLOBALS.ty
    },
    outside_grid (coord) {
        return coord.row < 0 || coord.row > GLOBALS.grid_dimensions.row - 1 || coord.column < 0 || coord.column > GLOBALS.grid_dimensions.column - 1;
    },

    get_coord_from_point (point) {
        let row, column;
        row = Math.floor(point.y / this.tile_dimensions.y);
        column = Math.floor(point.x / this.tile_dimensions.x);
        return {row: row, column: column};
    },

    get_point_from_coord (coord, dimensions) {
        let x, y;
        x = (coord.column * this.tile_dimensions.x) + (this.tile_dimensions.x / 2);
        y = (coord.row * this.tile_dimensions.y) + (this.tile_dimensions.y / 2);
        return new Phaser.Point(x, y);
    }
}

export class highLightableGroup extends Phaser.Group {
    constructor ({game, parent, name, addToStage, enableBody, physicsBodyType, size, isDownCallback, context}) {
        super(game, parent, name, addToStage, enableBody, physicsBodyType)
        this._hasHighlight = false
        this.marker = game.make.graphics();
        this.marker.lineStyle(2, 0xffffff, 1);
        this.marker.drawRect(0, 0, 16*size[0],16*size[1]);
        this.addChild(this.marker)

        this.isDownCallback = isDownCallback
        this.context = context

        this.callBack = _.debounce(this.isDownCallback.bind(this.context), 100)
    }
    markerOn(){
        this.marker.alpha = 1
    }
    toggleMarker(p){
        console.log('toggle', p,this.marker.alpha)
        this.marker.alpha = p
    }

    update(){
        if(game.input.hitTest(this, game.input.activePointer, new Phaser.Point())){
            this.swap(this.marker, this.getTop())
            this.marker.alpha = 1
            if(game.input.activePointer.isDown){
                this.callBack(this.name)
            }
        }else{
            this.marker.alpha = 0
        }
    }
    updateHitArea(){
        this.hitArea = this.getBounds()
    }
}

export const jMath = {
    radians: function(degrees) {
      return degrees * Math.PI / 180;
    },
 
    degrees: function(radians) {
      return radians * 180 / Math.PI;
    }
}
