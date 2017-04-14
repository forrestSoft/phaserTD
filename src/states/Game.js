/* globals __DEV__ */

import stampit from 'stampit'
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import {Pathfinders, Pathfinder} from '../engine/pathfinding'

import base_level from './base_level'

import { buildBoundInputMask } from '../utils'

import Prefab from '../prefabs/prefab'
import Player from '../prefabs/player'

import GLOBALS from '../config/globals'
import {Board} from '../ui/board'
import {Cursor, Brush} from '../ui/cursors'
import {Palette} from '../ui/palette'

export default class extends base_level {
  init () {
    
    GLOBALS.currentCollisionLayer =  function(){
        let a  = []
        this.board.map.layers[1].data.forEach( function (array,i) {
          let subArray = []
          array.forEach((cell,i) => {
            subArray.push(Object.assign({},cell))
          })
          a.push(subArray)
        })
      return a
    }.bind(this)

    GLOBALS.prefab_classes =  {
      "player": Player
    }
    

    this.level_data = this.cache.getJSON('level1');
    this.globalOffset = GLOBALS.globalOffset

    let tileset_index, tileDimensions, map;
    this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.scale.setUserScale(2,2)
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    
    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity

    this.board = Board(null,{name: 'level1', mapData: this.level_data.map})
    this.map = this.board.buildMap()

    // initialize pathfinding
    tileDimensions = new Phaser.Point(this.board.map.tileWidth, this.board.map.tileHeight);
    // this.pathfinding = this.game.plugins.add(Pathfinding, this.board.map.layers[1].data, [-1, 25], tile_dimensions);
    const stars = Pathfinders()
    stars.add({
      creep: {
        grid: this.board.map.layers[1].data,
        acceptableTiles: [-1,25], 
        tileDimensions: tileDimensions
      },
      cursor: {
        grid: GLOBALS.currentCollisionLayer(),
        acceptableTiles: [-1,25], 
        tileDimensions: tileDimensions
      }
    })
    GLOBALS.stars = stars
    // this.pathfinding.build(this.board.map.layers[1].data, [-1, 25], tile_dimensions);

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
    this.prefabs = {}
    this.board.buildLayers(this.groups, this.layers)
    this.board.buildGroups(this.groups)
    this.board.buildObjects(this.groups, this.prefabs,this)
    this.board.buildGoal(this.groups)
    this.board.buildSpawn(this.groups)
  
    this.baseLayer = this.layers['background']
  
    this.maskBoard()
    this.palette = Palette()
    this.cursor = Cursor({p:this})
    this.brush = Brush()

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
    buildBoundInputMask(rect)
  }

  onClick (point, event){
    this.brush.setTile.apply(this, arguments)
    this.move_player.apply(this,arguments)
  }
  
  move_player () {
    // console.log('mp', this.getPointFrom('mouse'))
    this.signals.playerMove.dispatch(this.getPointFrom('mouse'))
  }

  update () {
    // console.log(game.inputMasks.board.input.pointerOver(),game.inputMasks.palette.input.pointerDown())
  }
}
