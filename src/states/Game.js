/* globals __DEV__ */

import stampit from 'stampit'
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Pathfinding from '../pathfinding/pathfinding'

import base_level from './base_level'

import { buildBoundInputMask } from '../utils'

import Prefab from '../prefabs/prefab'
import Player from '../prefabs/player'
import {Cursor, Brush} from '../ui/cursors'
import {Palette} from '../ui/palette'

export default class extends base_level {
  init () {
    this.blah = true
    this.prefab_classes = {
        "player": Player
    };

    this.level_data = this.cache.getJSON('level1');

    this.globalOffset = {
      x: 0,
      y: 16
    }

    let tileset_index, tile_dimensions, map;
    this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    
    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 0;

    // create map and set tileset
    // debugger
    map = this.level_data.map
    this.map = this.game.add.tilemap('level1');
    this.map.tilesets.forEach(function (tileset, i) {
        this.map.addTilesetImage(tileset.name, map.tilesets[i]);
    }, this);

    // this.buildBrush();
    

    // initialize pathfinding
    tile_dimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
    this.pathfinding = this.game.plugins.add(Pathfinding, this.map.layers[1].data, [-1, 25], tile_dimensions);

    this.signals = {
      playerMove: new Phaser.Signal()
    }
  }

  create () {
    let group_name, object_layer, collision_tiles, tile_dimensions, layerObj;

    this.layers = {}
    this.groups = {
      board: this.game.add.group()
    }

    this.map.layers.forEach((layer) => {
      layerObj = this.map.createLayer(layer.name);
      this.layers[layer.name] = layerObj
      this.groups.board.addChild(layerObj)
      this.layers[layer.name].fixedToCamera = false;
    }, this);

    this.baseLayer = this.layers[this.map.layer.name]
    
    // create groups
    this.level_data.groups.forEach(function (group_name) {
        this.groups[group_name] = this.game.add.group();
    }, this);
    
    this.prefabs = {};
    let data = this.map.objects.objects[0];
    data.y = this.globalOffset.y
    
    this.groups.board.inputEnabled = true
    this.groups.board.addChild(this.create_object(data))
    
    this.maskBoard()
    this.palette = Palette()
    this.cursor = Cursor({p:this})
    this.brush = Brush({p:this, paints: [9]})

    game.inputMasks.board.events.onInputDown.add(this.onClick, this);
    window.g = this.game
    window.t = this
    
    this.groups.board.y = this.globalOffset.y
  }

  maskBoard (){
    let rect = {
      x: 0,
      y:16,
      height: 160,
      width: 160,
      objectToMask: this.groups.board,
      name: 'board'
    }
    this.mask = buildBoundInputMask(rect)
  }

  onClick (point, event){
    // this.setTile.apply(this, arguments)
    this.move_player.apply(this,arguments)
  }
  
  move_player () {
    // console.log('mp', this.getPointFrom('mouse'))
    this.signals.playerMove.dispatch(this.getPointFrom('mouse'))
  }

  update () {
    console.log(game.inputMasks.board.input.pointerOver(),game.inputMasks.palette.input.pointerDown())
  }
}
