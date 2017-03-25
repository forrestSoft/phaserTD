/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Pathfinding from '../pathfinding/pathfinding'

import Prefab from '../prefabs/prefab'
import Player from '../prefabs/player'

export default class extends Phaser.State {
  init () {
    this.prefab_classes = {
        "player": Player
    };

    let tileset_index, tile_dimensions, map;
    this.level_data = this.cache.getJSON('level1');
    
    this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    
    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 0;

    // create map and set tileset
    map = this.level_data.map
    this.map = this.game.add.tilemap(map.assetKey);
    this.map.tilesets.forEach(function (tileset, i) {
        this.map.addTilesetImage(tileset.name, map.tilesets[i]);
    }, this);

    // initialize pathfinding
    tile_dimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
    this.pathfinding = this.game.plugins.add(Pathfinding, this.map.layers[1].data, [-1], tile_dimensions);
  }

  create_object (object) {
    let object_y, position, prefab;
    // tiled coordinates starts in the bottom left corner
    object_y = (object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
    position = {"x": object.x + (this.map.tileHeight / 2), "y": object_y};
    // create object according to its type
    if (this.prefab_classes.hasOwnProperty(object.type)) {
      prefab = new this.prefab_classes[object.type](this, object.name, position, object.properties);
    }
    this.prefabs[object.name] = prefab;
  }

  move_player () {
    let target_position;
    var x = this.layers['background'].getTileX(game.input.activePointer.worldX);
    var y = this.layers['background'].getTileY(game.input.activePointer.worldY);

    var tile = this.map.getTile(x, y, 0);
    console.log(tile)

    target_position = new Phaser.Point(this.game.input.activePointer.x, this.game.input.activePointer.y);
    // console.log('target_positition',target_position, this.map.getTile(target_position.x,target_position.y,0))
    this.prefabs.player.move_to(target_position);
  }

  render () {
      this.game.debug.body(this.prefabs.player);
      this.game.debug.body(this.marker);
  }

  create () {
    let group_name, object_layer, collision_tiles;
    
    // create map layers
    this.layers = {};
    this.map.layers.forEach(function (layer) {
      console.log(layer.name)
        this.layers[layer.name] = this.map.createLayer(layer.name);
        if (layer.properties.collision) { // collision layer
            collision_tiles = [];
            layer.data.forEach(function (data_row) { // find tiles used in the layer
                data_row.forEach(function (tile) {
                    // check if it's a valid tile index and isn't already in the list
                    if (tile.index > 0 && collision_tiles.indexOf(tile.index) === -1) {
                        collision_tiles.push(tile.index);
                    }
                }, this);
            }, this);
            this.map.setCollision(collision_tiles, true, layer.name);
        }
    }, this);
    
    // resize the world to be the size of the current layer
    this.layers[this.map.layer.name].resizeWorld();
    
    // create groups
    this.groups = {};
    this.level_data.groups.forEach(function (group_name) {
        this.groups[group_name] = this.game.add.group();
    }, this);
    
    this.prefabs = {};
    
    for (object_layer in this.map.objects) {
        if (this.map.objects.hasOwnProperty(object_layer)) {
            // create layer objects
            this.map.objects[object_layer].forEach(this.create_object, this);
        }
    }
    
    // add user input to move player
    this.game.input.onDown.add(this.move_player, this);
    console.log(this.map.getTile(1,1,0))

    //////////////////
    this.marker = game.add.graphics();
    this.marker.lineStyle(2, 0xffffff, 1);
    this.marker.drawRect(0, 0, 16, 16);

    this.game.input.addMoveCallback(this.updateMarker, this);

    this.game.input.onDown.add(this.getTileProperties, this);
  }

  updateMarker() {
    this.marker.x = this.layers.background.getTileX(this.game.input.activePointer.worldX) * 16;
    this.marker.y = this.layers.background.getTileY(this.game.input.activePointer.worldY) * 16;
  }

  getTileProperties() {
    console.log('click', this.layers)
    var x = this.layers.background.getTileX(this.game.input.activePointer.worldX);
    var y = this.layers.background.getTileY(this.game.input.activePointer.worldY);

    var tile = this.map.getTile(x, y, this.layers.background);

    tile.properties.wibble = true;

  }
}
