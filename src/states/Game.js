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

    this.size = {
      g: {
        h: 25,
        w: 25
      },
      t: {
        h: 16,
        w: 16
      }
    }
    let tileset_index, tile_dimensions, map;
    // this.level_data = this.cache.getJSON('level1');
    
    this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    
    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 0;

    // create map and set tileset
    // map = this.level_data.map
    // this.map = this.game.add.tilemap(map.assetKey);
    // this.map.tilesets.forEach(function (tileset, i) {
    //     this.map.addTilesetImage(tileset.name, map.tilesets[i]);
    // }, this);

    
    this.game.input.onDown.add(this.setTile, this);

    // initialize pathfinding
    

    this.signals = {
      playerMove: new Phaser.Signal()
    }
  }

  setTile (sprite, pointer){
    this.map.putTile(Phaser.Math.between(0,16), this.layers.layer1.getTileX(this.game.input.activePointer.worldX),this.layers.layer1.getTileY(this.game.input.activePointer.worldY), this.layers.layer1);
  }

  create () {
    let group_name, object_layer, collision_tiles, tile_dimensions;
    this.map = this.game.add.tilemap();
    

    //  Add a Tileset image to the map
    this.map.addTilesetImage('map_tileset','map_tileset', 16,16);
    this.layers = {
      layer1: this.map.create('level1', 10,10,16,16)
    }
    // this.layers.layer1.setScale(.5,.5)
    this.layers.layer1.resizeWorld();
    // this.layers.layer1.scale = {x:.5, y:.5};
    // tile_dimensions = new Phaser.Point(this.size.t.w, this.size.t.h);
    // this.pathfinding = this.game.plugins.add(Pathfinding, this.map.layers[0].data, [-1], tile_dimensions);
    // create map layers
    // this.layers = {};
    // this.map.layers.forEach(function (layer) {
    //   console.log(layer.name)
    //     this.layers[layer.name] = this.map.createLayer(layer.name);
    //     if (layer.properties.collision) { // collision layer
    //         collision_tiles = [];
    //         layer.data.forEach(function (data_row) { // find tiles used in the layer
    //             data_row.forEach(function (tile) {
    //                 // check if it's a valid tile index and isn't already in the list
    //                 if (tile.index > 0 && collision_tiles.indexOf(tile.index) === -1) {
    //                     collision_tiles.push(tile.index);
    //                 }
    //             }, this);
    //         }, this);
    //         this.map.setCollision(collision_tiles, true, layer.name);
    //     }
    // }, this);
    
    // // resize the world to be the size of the current layer
    
    
    // // create groups
    // this.groups = {};
    // this.level_data.groups.forEach(function (group_name) {
    //     this.groups[group_name] = this.game.add.group();
    // }, this);
    
    // this.prefabs = {};
    
    // for (object_layer in this.map.objects) {
    //     if (this.map.objects.hasOwnProperty(object_layer)) {
    //         // create layer objects
    //         this.map.objects[object_layer].forEach(this.create_object, this);
    //     }
    // }
    
    // // add user input to move player
    // this.game.input.onDown.add(this.move_player, this);

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
