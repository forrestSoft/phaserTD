/* globals __DEV__ */

import stampit from 'stampit'
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import {Pathfinders, Pathfinder} from '../engine/pathfinding'

import base_level from './base_level'

import { buildBoundInputMask } from '../utils'

import Prefab from '../prefabs/prefab'
import Player from '../prefabs/player'
import {CreepManager} from '../prefabs/creeps'

import GLOBALS from '../config/globals'
import {Board} from '../ui/board'
import {Cursor, Brush} from '../ui/cursors'
import {Palette} from '../ui/palette'
import {TowerPalette} from '../ui/towerPalette'

export default class extends base_level {
  init () {
    this.buildDynamicGlobals()

    this.level_data = this.cache.getJSON('level1');
    this.globalOffset = GLOBALS.globalOffset

    let tileset_index, tileDimensions, map;
    this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.scale.setUserScale(2,2)
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    
    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    // this.game.physics.arcade.gravity

    this.layers = {}
    this.groups = {
      board: this.game.add.group(undefined,'board')
    }
    this.prefabs = {}
    this.objects = {}
    this.board = Board({
      name: 'level1',
      mapData: this.level_data.map,
      groups: this.groups,
      layers:this.layers,
      state: this,
      objects: this.objects
    })
    this.map = this.board.buildMap()

    // initialize pathfinding
    tileDimensions = new Phaser.Point(this.board.map.tileWidth, this.board.map.tileHeight);
    const stars = Pathfinders()
    stars.add({
      creep: {
        grid: this.board.map.layers[1].data,
        acceptableTiles: GLOBALS.acceptableTiles, 
        tileDimensions: tileDimensions
      },
      cursor: {
        grid: GLOBALS.currentCollisionLayer(),
        acceptableTiles: GLOBALS.acceptableTiles, 
        tileDimensions: tileDimensions
      }
    })
    GLOBALS.stars = stars
    GLOBALS.boardGroup = this.groups.board

    this.signals = {
      playerMove: new Phaser.Signal()
    }
  }
  start(){
    GLOBALS.signals.waveStart.dispatch()
  }
  create () {
    let group_name, object_layer, collision_tiles, tile_dimensions, layerObj;

    GLOBALS.timers = {
      firstWave: game.time.events.add(Phaser.Timer.SECOND * GLOBALS.waves.beforeBegin, this.start, this)
    }

    this.board.buildForCreate()
  
    this.baseLayer = this.layers['background']
  
    this.maskBoard()

    this.palette = Palette({ brushes: GLOBALS.fancyBrushes, fancyBrush: true})
    this.palette2 = Palette({ y: 0, x: 240})
    this.towerPalette = TowerPalette().build()
    this.cursor = Cursor({p:this, group: this.groups.board})
    this.brush = Brush()

    game.inputMasks.board.events.onInputDown.add(this.onClick, this);
    window.g = this.game
    window.t = this
    this.groups.board.y = this.globalOffset.y

    GLOBALS.stars.get('creep').find_path_goal_spawn();

    this.life = 20
    GLOBALS.signals.creepReachedGoal.add(this.loseLife, this)

    // game.time.events.repeat(Phaser.Timer.SECOND * 2.5, 7, this.board.buildCreep, this.board);
  }
  loseLife(){
    this.life --
  }

  maskBoard (){
    let rect = {
      x: 0,
      y:16,
      width: GLOBALS.height * GLOBALS.tx,
      height: GLOBALS.width * GLOBALS.ty,
      objectToMask: this.groups.board,
      name: 'board'
    }
    buildBoundInputMask(rect)
  }

  onClick (point, event){
    // this.brush.setTile.apply(this, arguments)
    // this.move_player.apply(this,arguments)
    GLOBALS.signals.paintWithBrush.dispatch()
  }
  
  move_player () {
    // console.log('mp', this.getPointFrom('mouse'))
    // this.signals.playerMove.dispatch(this.getPointFrom('mouse'))
  }

  update () {
    let g = this.board.getCollisionObjects()
    if(game.bullets){
      game.physics.arcade.overlap(g[0], game.bullets, this.dispatchCollision, null, this);
    }
  }
  dispatchCollision(player,bullet){
    bullet.kill()
    player.hit()
  }

  render(){
    if(window.pp){
      // game.debug.spriteBounds(pp);
      // game.debug.spriteInfo(this.board.getCollisionObjects()[0], true, true);
    }
    let text = `life: ${this.life} next wave: ${(GLOBALS.timers.firstWave.timer.duration / 1000).toFixed(0)}`
    game.debug.text(text,2,12)
  }

  buildDynamicGlobals(){
    const tempGLOBALS = {
      currentCollisionLayer: function(){
          let a  = []
          this.board.map.layers[1].data.forEach( function (array,i) {
            let subArray = []
            array.forEach((cell,i) => {
              subArray.push(Object.assign({},cell))
            })
            a.push(subArray)
          })
        return a
      }.bind(this),

      prefab_classes:  {
        "player": Player
      },

      signals: {
        creepPathReset: new Phaser.Signal(),
        updateBrush: new Phaser.Signal(),
        paintWithBrush: new Phaser.Signal(),
        creepReachedGoal: new Phaser.Signal(),
        waveStart: new Phaser.Signal()
      }
    }
    Object.assign(GLOBALS, tempGLOBALS)

    window.GLOBALS = GLOBALS
  }
}
