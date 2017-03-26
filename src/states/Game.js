/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Pathfinding from '../pathfinding/pathfinding'

import base_level from './base_level'

import Prefab from '../prefabs/prefab'
import Player from '../prefabs/player'

export default class extends base_level {
  init () {
    this.prefab_classes = {
        "player": Player
    };
    this.level_data = this.cache.getJSON('level1');

    let tileset_index, tile_dimensions, map;
    // this.level_data = this.cache.getJSON('level1');
    
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
    this.brushIDs = [8,9,25]
    this.brushID = 0
    this.game.input.onDown.add(this.setTile, this);

    // initialize pathfinding
    tile_dimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
    this.pathfinding = this.game.plugins.add(Pathfinding, this.map.layers[1].data, [-1, 25], tile_dimensions);
    // debugger

    this.signals = {
      playerMove: new Phaser.Signal()
    }
  }

  nextBrushID (){
    if(this.brushID < this.brushIDs.length - 1){
      this.brushID ++
    }else{
      this.brushID = 0
    }
    console.log('nexxt brush', this.brushIDs[this.brushID])
    return this.brushIDs[this.brushID]
  }

  setTile (sprite, pointer){
    let {x,y} = this.game.input.activePointer

    this.map.putTile(this.nextBrushID(), this.baseLayer.getTileX(x),this.baseLayer.getTileY(y), 'collision');

    this.prefabs.player.position.x = 0;
    this.prefabs.player.position.y = 0;

    this.pathfinding.setGrid(this.map.layers[1].data)
  }

  create () {
    let group_name, object_layer, collision_tiles, tile_dimensions;
    
    this.layers = {}
    this.map.layers.forEach(function (layer) {
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
    this.baseLayer = this.layers[this.map.layer.name]
    this.baseLayer.resizeWorld();
    
    this.collision_tiles = []
    
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

    // // add user input to move player
    this.game.input.onDown.add(this.move_player, this);

    this.buildAndBind_cursor()
  }

  move_player () {
    this.signals.playerMove.dispatch(this.getPointFrom('mouse'))
  }

  render () {
      // this.game.debug.body(this.prefabs.player);
      // this.game.debug.body(this.marker);
  }
}
