import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Pathfinding from '../pathfinding/pathfinding'

import Prefab from '../prefabs/prefab'
import Player from '../prefabs/player'

export default class extends Phaser.State {
	buildAndBind_cursor (){
		this.marker = game.add.graphics();
	    this.marker.lineStyle(2, 0xffffff, 1);
	    this.marker.drawRect(0, 0, 16,16);

	    this.game.input.addMoveCallback(this.updateMarker, this);

	    // this.game.input.onDown.add(this.getTileProperties, this);
	}

	updateMarker() {
		this.marker.x = this.baseLayer.getTileX(this.game.input.activePointer.worldX) * this.map.tileWidth;
		this.marker.y = this.baseLayer.getTileY(this.game.input.activePointer.worldY) * this.map.tileHeight;
	}

	getTileProperties() {
		var x = this.layers.layer1.getTileX(this.game.input.activePointer.worldX);
		var y = this.layers.layer1.getTileY(this.game.input.activePointer.worldY);

		var tile = this.map.getTile(x, y, this.layers.background);
		console.log(tile)
		tile.properties.wibble = true;
	}

	getPointFrom(where) {
		switch (where){
			case 'mouse':
				return new Phaser.Point(this.game.input.activePointer.x, this.game.input.activePointer.y)
				break
		}
	}

	getTileFrom(where){
		let x, y, tile
		switch(where){
			case 'mouse':
				x = this.layers.layer1.getTileX(game.input.activePointer.worldX);
			    y = this.layers.layer1.getTileY(game.input.activePointer.worldY);

			    return this.map.getTile(x, y, 0);
			    break

		}
	}

	create_object (object) {
		let object_y, position, prefab;
		// tiled coordinates starts in the bottom left corner
		object_y = (object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
		position = {"x": object.x + (this.map.tileHeight / 2), "y": object_y};
		// create object according to its type
		if (this.prefab_classes.hasOwnProperty(object.type)) {
			console.log(1)
		  prefab = new this.prefab_classes[object.type](this, object.name, position, object.properties);
		}
		this.prefabs[object.name] = prefab;
	}
}