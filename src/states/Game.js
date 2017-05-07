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
    this.monkeyPatches()

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

    GLOBALS.groups = this.groups

    // this.groups.board.ignoreChildInput = true
    // this.groups.board.inputEnableChildren = true
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
      firstWave: game.time.create(false)
    }

    GLOBALS.timers.firstWave.add(Phaser.Timer.SECOND * GLOBALS.waves.beforeBegin, this.start, this)
    GLOBALS.timers.firstWave.start()

    this.maskBoard()
    this.board.buildForCreate()
  
    this.baseLayer = this.layers['background']
  

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

    // this.life = 20
    GLOBALS.signals.creepReachedGoal.add(this.loseLife, this)
    GLOBALS.signals.towerPlaced.add(this.loseGold, this)
    GLOBALS.signals.creepKilled.add(this.getGold, this)
  }
  loseLife(){
    GLOBALS.player.life --
  }
  loseGold(){
    GLOBALS.player.gold -= 5
  }
  getGold(gold = 1){
    GLOBALS.player.gold += gold
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

    GLOBALS.groups.creeps.sort('y', Phaser.Group.SORT_ASCENDING);
    
    if(!game.input.activePointer.withinGame){
      GLOBALS.signals.outOfGame.dispatch()
    }
  }
  dispatchCollision(player,bullet){
    bullet.kill()
    player.hit(bullet.damageValue)
  }

  render(){
    try{
      // game.bullets[0].children.forEach((b,i)=>{
      //   game.debug.body(game.bullets[0].children[i])
      // })
      // game.debug.spriteInfo(game.bullets[0].children[0])
      game.debug.body(this.groups.board.children[5].children[0])
      // game.debug.spriteInfo(this.groups.board.children[5].children[0], 16,16)
      // game.debug.spriteBounds(towers[0].sprite)
      // game.debug.spriteInfo(towers[0].sprite, 16,16)
    }catch(e){}

    let life = GLOBALS.player.life
    let gold = GLOBALS.player.gold
    let duration = (GLOBALS.timers.firstWave.duration / 1000).toFixed(0)
    let text = `life: ${life} next wave: ${duration} gold: ${gold}`
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

      signals: {}
    }

    let signalNames = ['creepPathReset', 'updateBrush', 'paintWithBrush',
                       'creepReachedGoal', 'waveStart', 'outOfGame', 'towerPlaced',
                       'creepKilled'].forEach((name,i)=>{
                          tempGLOBALS.signals[name] = new Phaser.Signal()                  
                       })      

    Object.assign(GLOBALS, tempGLOBALS)

    window.GLOBALS = GLOBALS
  }

  monkeyPatches(){
    // Phaser.Physics.Arcade.Body.prototype.reset = function(x, y) {
    //   console.log('r', this.position)
    //   // debugger
    //   this.velocity.set(0);
    //   this.acceleration.set(0);
    //   y += 16
    //   this.speed = 0;
    //   this.angularVelocity = 0;
    //   this.angularAcceleration = 0;

    //   this.position.x = (x - (this.sprite.anchor.x * this.sprite.width)) + this.sprite.scale.x * this.offset.x;
    //   // debugger
    //   this.position.x -= this.sprite.scale.x < 0 ? this.width : 0;
    //   // debugger
    //   this.position.y = (y - (this.sprite.anchor.y * this.sprite.height)) + this.sprite.scale.y * 16//this.offset.y;
    //   // debugger
    //   this.position.y -= this.sprite.scale.y < 0 ? this.height : 0;
    //   // debugger
    //   // this.position.y += 160

    //   this.prev.x = this.position.x;
    //   this.prev.y = this.position.y;
    //   // console.log(this.position, this.prev)
    //   this.rotation = this.sprite.angle;
    //   this.preRotation = this.rotation;

    //   this.updateBounds();

    //   this.center.setTo(this.position.x + this.halfWidth, this.position.y + this.halfHeight);
    //   console.log('--', this.position)
    //   // debugger

    // };

    // Phaser.Weapon.prototype.fire = function (from, x, y, offsetX, offsetY) {
    //     // debugger
    //     if (x === undefined) { x = null; }
    //     if (y === undefined) { y = null; }

    //     if (this.game.time.now < this._nextFire || (this.fireLimit > 0 && this.shots === this.fireLimit))
    //     {
    //         return null;
    //     }

    //     var speed = this.bulletSpeed;

    //     //  Apply +- speed variance
    //     if (this.bulletSpeedVariance !== 0)
    //     {
    //         speed += Phaser.Math.between(-this.bulletSpeedVariance, this.bulletSpeedVariance);
    //     }

    //     if (from)
    //     {
    //         if (this.fireFrom.width > 1)
    //         {
    //             this.fireFrom.centerOn(from.x, from.y);
    //         }
    //         else
    //         {
    //             this.fireFrom.x = from.x;
    //             this.fireFrom.y = from.y;
    //         }
    //     }
    //     else if (this.trackedSprite)
    //     {
    //         if (this.trackRotation)
    //         {
    //             this._rotatedPoint.set(this.trackedSprite.world.x + this.trackOffset.x, this.trackedSprite.world.y + this.trackOffset.y);
    //             this._rotatedPoint.rotate(this.trackedSprite.world.x, this.trackedSprite.world.y, this.trackedSprite.worldRotation);

    //             if (this.fireFrom.width > 1)
    //             {
    //                 this.fireFrom.centerOn(this._rotatedPoint.x, this._rotatedPoint.y);
    //             }
    //             else
    //             {
    //                 this.fireFrom.x = this._rotatedPoint.x;
    //                 this.fireFrom.y = this._rotatedPoint.y;
    //             }
    //         }
    //         else
    //         {
    //             if (this.fireFrom.width > 1)
    //             {
    //                 this.fireFrom.centerOn(this.trackedSprite.world.x + this.trackOffset.x, this.trackedSprite.world.y + this.trackOffset.y);
    //             }
    //             else
    //             {
    //                 this.fireFrom.x = this.trackedSprite.world.x + this.trackOffset.x;
    //                 this.fireFrom.y = this.trackedSprite.world.y + this.trackOffset.y;
    //             }
    //         }

    //         if (this.bulletInheritSpriteSpeed)
    //         {
    //             speed += this.trackedSprite.body.speed;
    //         }
    //     }
    //     else if (this.trackedPointer)
    //     {
    //         if (this.fireFrom.width > 1)
    //         {
    //             this.fireFrom.centerOn(this.trackedPointer.world.x + this.trackOffset.x, this.trackedPointer.world.y + this.trackOffset.y);
    //         }
    //         else
    //         {
    //             this.fireFrom.x = this.trackedPointer.world.x + this.trackOffset.x;
    //             this.fireFrom.y = this.trackedPointer.world.y + this.trackOffset.y;
    //         }
    //     }

    //     if (offsetX !== undefined)
    //     {
    //         this.fireFrom.x += offsetX;
    //     }

    //     if (offsetY !== undefined)
    //     {
    //         this.fireFrom.y += offsetY;
    //     }

    //     var fromX = (this.fireFrom.width > 1) ? this.fireFrom.randomX : this.fireFrom.x;
    //     var fromY = (this.fireFrom.height > 1) ? this.fireFrom.randomY : this.fireFrom.y;

    //     var angle = (this.trackRotation) ? this.trackedSprite.angle : this.fireAngle;

    //     //  The position (in world space) to fire the bullet towards, if set
    //     if (x !== null && y !== null)
    //     {
    //         angle = this.game.math.radToDeg(Math.atan2(y - fromY, x - fromX));
    //     }

    //     //  Apply +- angle variance
    //     if (this.bulletAngleVariance !== 0)
    //     {
    //         angle += Phaser.Math.between(-this.bulletAngleVariance, this.bulletAngleVariance);
    //     }

    //     var moveX = 0;
    //     var moveY = 0;

    //     //  Avoid sin/cos for right-angled shots
    //     if (angle === 0 || angle === 180)
    //     {
    //         moveX = Math.cos(this.game.math.degToRad(angle)) * speed;
    //     }
    //     else if (angle === 90 || angle === 270)
    //     {
    //         moveY = Math.sin(this.game.math.degToRad(angle)) * speed;
    //     }
    //     else
    //     {
    //         moveX = Math.cos(this.game.math.degToRad(angle)) * speed;
    //         moveY = Math.sin(this.game.math.degToRad(angle)) * speed;
    //     }

    //     var bullet = null;

    //     if (this.autoExpandBulletsGroup)
    //     {
    //         bullet = this.bullets.getFirstExists(false, true, fromX, fromY, this.bulletKey, this.bulletFrame);

    //         bullet.data.bulletManager = this;
    //     }
    //     else
    //     {
    //         bullet = this.bullets.getFirstExists(false);
    //     }

    //     if (bullet)
    //     {
    //       debugger
    //         bullet.reset(fromX, fromY);

    //         bullet.data.fromX = fromX;
    //         bullet.data.fromY = fromY;
    //         bullet.data.killType = this.bulletKillType;
    //         bullet.data.killDistance = this.bulletKillDistance;
    //         bullet.data.rotateToVelocity = this.bulletRotateToVelocity;

    //         if (this.bulletKillType === Phaser.Weapon.KILL_LIFESPAN)
    //         {
    //             bullet.lifespan = this.bulletLifespan;
    //         }

    //         bullet.angle = angle + this.bulletAngleOffset;

    //         //  Frames and Animations
    //         if (this.bulletAnimation !== '')
    //         {
    //             if (bullet.animations.getAnimation(this.bulletAnimation) === null)
    //             {
    //                 var anim = this.anims[this.bulletAnimation];

    //                 bullet.animations.add(anim.name, anim.frames, anim.frameRate, anim.loop, anim.useNumericIndex);
    //             }

    //             bullet.animations.play(this.bulletAnimation);
    //         }
    //         else
    //         {
    //             if (this.bulletFrameCycle)
    //             {
    //                 bullet.frame = this.bulletFrames[this.bulletFrameIndex];

    //                 this.bulletFrameIndex++;

    //                 if (this.bulletFrameIndex >= this.bulletFrames.length)
    //                 {
    //                     this.bulletFrameIndex = 0;
    //                 }
    //             }
    //             else if (this.bulletFrameRandom)
    //             {
    //                 bullet.frame = this.bulletFrames[Math.floor(Math.random() * this.bulletFrames.length)];
    //             }
    //         }

    //         if (bullet.data.bodyDirty)
    //         {
    //             if (this._data.customBody)
    //             {
    //             console.log('ss')
    //                 bullet.body.setSize(this._data.width, this._data.height, this._data.offsetX, this._data.offsetY);
    //             }

    //             bullet.body.collideWorldBounds = this.bulletCollideWorldBounds;

    //             bullet.data.bodyDirty = false;
    //         }

    //         bullet.body.velocity.set(moveX, moveY);
    //         bullet.body.gravity.set(this.bulletGravity.x, this.bulletGravity.y);

    //         var next = 0;

    //         if (this.bulletSpeedVariance !== 0)
    //         {
    //             var rate = this.fireRate;

    //             rate += Phaser.Math.between(-this.fireRateVariance, this.fireRateVariance);

    //             if (rate < 0)
    //             {
    //                 rate = 0;
    //             }

    //             next = this.game.time.now + rate;
    //         }
    //         else
    //         {
    //             next = this.game.time.now + this.fireRate;
    //         }

    //         if (this.multiFire)
    //         {
    //             if (!this._hasFired)
    //             {
    //                 //  We only add 1 to the 'shots' count for multiFire shots
    //                 this._hasFired = true;
    //                 this._tempNextFire = next;
    //                 this.shots++;
    //             }
    //         }
    //         else
    //         {
    //             this._nextFire = next;

    //             this.shots++;
    //         }

    //         this.onFire.dispatch(bullet, this, speed);

    //         if (this.fireLimit > 0 && this.shots === this.fireLimit)
    //         {
    //             this.onFireLimit.dispatch(this, this.fireLimit);
    //         }
    //     }
    //     // debugger
    //     return bullet;

    // }

    // Phaser.Game.prototype.updateLogic = function(timeStep){
    //     if(window.doIt == true){
    //       debugger
    //     }
    //   if (!this._paused && !this.pendingStep){
    //       if (this.stepping){
    //           this.pendingStep = true;
    //       }
    //       this.scale.preUpdate();
    //       this.debug.preUpdate();
    //       this.camera.preUpdate();
    //       this.physics.preUpdate();
    //       if(window.doIt == true){
    //       debugger
    //     }
    //       this.state.preUpdate(timeStep);
    //       if(window.doIt == true){
    //       debugger
    //     }
    //       this.plugins.preUpdate(timeStep);
    //       if(window.doIt == true){
    //       debugger
    //     }
    //       this.stage.preUpdate();
    //       if(window.doIt == true){
    //       debugger
    //     }
    //       this.state.update();
    //       this.stage.update();
    //       this.tweens.update();
    //       this.sound.update();
    //       this.input.update();
    //       this.physics.update();
    //       this.particles.update();
    //       this.plugins.update();
    //     //   if(window.doIt == true){
    //     //   debugger
    //     // }
    //       this.stage.postUpdate();
    //       this.plugins.postUpdate();
    //     //   if(window.doIt == true){
    //     //   debugger
    //     // }
    //   }else{
    //       // Scaling and device orientation changes are still reflected when paused.
    //       this.scale.pauseUpdate();
    //       this.state.pauseUpdate(timeStep);
    //       this.debug.preUpdate();
    //   }


    //   this.stage.updateTransform();
    // }
//      Phaser.Physics.Arcade.Body.prototype.preUpdate = function () {

//         if (!this.enable || this.game.physics.arcade.isPaused)
//         {
//             return;
//         }

//         this.dirty = true;

//         //  Store and reset collision flags
//         this.wasTouching.none = this.touching.none;
//         this.wasTouching.up = this.touching.up;
//         this.wasTouching.down = this.touching.down;
//         this.wasTouching.left = this.touching.left;
//         this.wasTouching.right = this.touching.right;

//         this.touching.none = true;
//         this.touching.up = false;
//         this.touching.down = false;
//         this.touching.left = false;
//         this.touching.right = false;

//         this.blocked.up = false;
//         this.blocked.down = false;
//         this.blocked.left = false;
//         this.blocked.right = false;

//         this.overlapR = 0;
//         this.overlapX = 0;
//         this.overlapY = 0;

//         this.embedded = false;
// if(window.doIt == true){
//           debugger
//         }
//         this.updateBounds();
// if(window.yyy == true){
//           debugger
//         }
//         this.position.x = (this.sprite.world.x - (this.sprite.anchor.x * this.sprite.width)) + this.sprite.scale.x * this.offset.x;
//         this.position.x -= this.sprite.scale.x < 0 ? this.width : 0;

//         this.position.y = (this.sprite.world.y - (this.sprite.anchor.y * this.sprite.height)) + this.sprite.scale.y * this.offset.y;
//         this.position.y -= this.sprite.scale.y < 0 ? this.height : 0;
//         this.position.y += 16
//         this.rotation = this.sprite.angle;

//         this.preRotation = this.rotation;
// if(window.doIt == true){
//           debugger
//         }
//         if (this._reset || this.sprite.fresh)
//         {
//             this.prev.x = this.position.x;
//             this.prev.y = this.position.y;
//         }

//         if (this.moves)
//         {
//             this.game.physics.arcade.updateMotion(this);

//             this.newVelocity.set(this.velocity.x * this.game.time.physicsElapsed, this.velocity.y * this.game.time.physicsElapsed);

//             this.position.x += this.newVelocity.x;
//             this.position.y += this.newVelocity.y;
// if(window.yyy == true){
// debugger}
//             if (this.position.x !== this.prev.x || this.position.y !== this.prev.y)
//             {
//                 this.angle = Math.atan2(this.velocity.y, this.velocity.x);
//             }

//             this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

//             //  Now the State update will throw collision checks at the Body
//             //  And finally we'll integrate the new position back to the Sprite in postUpdate

//             if (this.collideWorldBounds)
//             {
//                 if (this.checkWorldBounds() && this.onWorldBounds)
//                 {
//                     this.onWorldBounds.dispatch(this.sprite, this.blocked.up, this.blocked.down, this.blocked.left, this.blocked.right);
//                 }
//             }
//         }
// if(window.doIt == true){
//           debugger
//         }
//         this._dx = this.deltaX();
//         this._dy = this.deltaY();

//         this._reset = false;

//     }
  

//   Phaser.Game.prototype.update = function (time) {
//         if(window.doIt == true){
//           debugger
//         }
//         this.time.update(time);

//         if (this._kickstart)
//         {
//             this.updateLogic(this.time.desiredFpsMult);
// if(window.doIt == true){
//           debugger
//         }
//             // call the game render update exactly once every frame
//             this.updateRender(this.time.slowMotion * this.time.desiredFps);
// if(window.doIt == true){
//           debugger
//         }
//             this._kickstart = false;

//             return;
//         }

//         // if the logic time is spiraling upwards, skip a frame entirely
//         if (this._spiraling > 1 && !this.forceSingleUpdate)
//         {
//             // cause an event to warn the program that this CPU can't keep up with the current desiredFps rate
//             if (this.time.time > this._nextFpsNotification)
//             {
//                 // only permit one fps notification per 10 seconds
//                 this._nextFpsNotification = this.time.time + 10000;

//                 // dispatch the notification signal
//                 this.fpsProblemNotifier.dispatch();
//             }

//             // reset the _deltaTime accumulator which will cause all pending dropped frames to be permanently skipped
//             this._deltaTime = 0;
//             this._spiraling = 0;
// if(window.doIt == true){
//           debugger
//         }
//             // call the game render update exactly once every frame
//             this.updateRender(this.time.slowMotion * this.time.desiredFps);
//             if(window.doIt == true){
//           debugger
//         }
//         }
//         else
//         {
//             // step size taking into account the slow motion speed
//             var slowStep = this.time.slowMotion * 1000.0 / this.time.desiredFps;

//             // accumulate time until the slowStep threshold is met or exceeded... up to a limit of 3 catch-up frames at slowStep intervals
//             this._deltaTime += Math.max(Math.min(slowStep * 3, this.time.elapsed), 0);

//             // call the game update logic multiple times if necessary to "catch up" with dropped frames
//             // unless forceSingleUpdate is true
//             var count = 0;

//             this.updatesThisFrame = Math.floor(this._deltaTime / slowStep);

//             if (this.forceSingleUpdate)
//             {
//                 this.updatesThisFrame = Math.min(1, this.updatesThisFrame);
//             }

//             while (this._deltaTime >= slowStep)
//             {
//                 this._deltaTime -= slowStep;
//                 this.currentUpdateID = count;
// if(window.doIt == true){
//           debugger
//         }
//                 this.updateLogic(this.time.desiredFpsMult);
// if(window.doIt == true){
//           debugger
//         }
//                 count++;

//                 if (this.forceSingleUpdate && count === 1)
//                 {
//                     break;
//                 }
//                 else
//                 {
//                     this.time.refresh();
//                 }
//             }

//             // detect spiraling (if the catch-up loop isn't fast enough, the number of iterations will increase constantly)
//             if (count > this._lastCount)
//             {
//                 this._spiraling++;
//             }
//             else if (count < this._lastCount)
//             {
//                 // looks like it caught up successfully, reset the spiral alert counter
//                 this._spiraling = 0;
//             }

//             this._lastCount = count;
// if(window.doIt == true){
//           debugger
//         }
//             // call the game render update exactly once every frame unless we're playing catch-up from a spiral condition
//             this.updateRender(this._deltaTime / slowStep);
//         if(window.doIt == true){
//           debugger
//         }
//         }
//         if(window.doIt == true){
//           debugger
//         }
// }
// Phaser.Component.Reset.prototype.reset = function (x, y, health) {

//     if (health === undefined) { health = 1; }
//     debugger
//     this.world.set(x, y);
//     this.position.set(x, y);

//     this.fresh = true;
//     this.exists = true;
//     this.visible = true;
//     this.renderable = true;

//     if (this.components.InWorld)
//     {
//         this._outOfBoundsFired = false;
//     }

//     if (this.components.LifeSpan)
//     {
//         this.alive = true;
//         this.health = health;
//     }

//     if (this.components.PhysicsBody)
//     {
//         if (this.body)
//         {
//             this.body.reset(x, y, false, false);
//         }
//     }

//     return this;

// };
    }
}
