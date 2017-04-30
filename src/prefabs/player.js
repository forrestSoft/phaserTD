import Prefab from './prefab'

import GLOBALS from '../config/globals'

export default class extends Prefab {
    constructor (game_state, name, position, properties) {
        super(game_state, name, position, properties);
        
        this.anchor.setTo(0.5);
        this.scale.setTo(0.666, 0.5);
        
        this.walking_speed = +properties.walking_speed;

        this.game_state.game.physics.arcade.enable(this);
        // change the size and position of the collision box
        this.body.setSize(10, 22, 8, 8);
        this.body.collideWorldBounds = true;
            
        // set anchor point to be the center of the collision box
        this.anchor.setTo(0.5, 0.5);
        
        this.path = [];
        this.path_step = -1;

        this.animations.add('walkNorth', [0,1,2], 10, true)
        this.animations.add('walkEast', [3,4,5], 10, true)
        this.animations.add('walkSouth', [6,7,8], 10, true)
        this.animations.add('walkWest', [9,10,11], 10, true)
        
        game_state.signals.playerMove.add(this.move_to, this);
        GLOBALS.signals.creepPathReset.add(this.reset,this)

        this.life = 15
    }
    hit(){
        console.log('hit')
        this.life --

        if(this.life == 0){
            let explosionAnimation = GLOBALS.kabooms.getFirstExists(false);
            explosionAnimation.reset(this.x, this.y);
            explosionAnimation.play('kaboom', 30, false, true);
            this.kill()
        }
    }
    reset(){
        this.path = GLOBALS.stars.get_path('creep')

        if(this.path_step == -1){
            this.path_step = 0
        }else{
            this.path.some((point,i)=>{
                    // console.log('match',this.position.x < point.x , this.position.y < point.y)  
                if(this.position.x < point.x && this.position.y < point.y){
                    this.path_step = i
                    return true
                }else{
                    return false
                }
            })
        }
    }

    update () {
        if(!GLOBALS.stars.get('creep').hasPath){
            return
        }

        if(this.path_step == -1){
            this.path_step = 0
        }

        this.path = GLOBALS.stars.get_path('creep')
        // debugger

        let next_position, velocity, tempPath;
        this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
        
        if (this.path.length > 0) {
            next_position = this.path[this.path_step];
            
            if (!this.reached_target_position(next_position)) {
                velocity = new Phaser.Point(next_position.x - this.position.x,
                                       next_position.y - this.position.y);
                velocity.normalize();
                this.velocity = velocity
                // console.log(this.velocity)
                let s,n
                n = ((Math.atan2(-velocity.y,-velocity.x)))
                if(n < -3 || n > 3){
                    s = 'East'
                }else if(n < -1.5){
                    s = 'South'
                }else if(n > 1.5){
                    s = 'North'
                }else{
                    s = 'West'
                }

                this.animations.play('walk'+s)
                
                this.body.velocity.x = velocity.x * this.walking_speed;
                this.body.velocity.y = velocity.y * this.walking_speed;
            } else {
                this.position.x = next_position.x;
                this.position.y = next_position.y;
                if (this.path_step < this.path.length - 1) {
                    this.path_step += 1;
                } else {
                    GLOBALS.signals.creepReachedGoal.dispatch()
                    this.destroy()
                }
            }
        }
    }

    reached_target_position (target_position) {
        let distance;
        distance = Phaser.Point.distance(this.position, target_position);
        return distance < 1;
    }

    move_to (target_position) {
        // console.log(tiles'player position',this.position)
        this.calculateOffsetHack()
        // GLOBALS.stars.get('creep').find_path(this.position, target_position, this.move_through_path, this);
    }

    // move_to_brush (target_position) {
    //     this.game_state.pathfinding.find_path_from_brush(this.position, target_position, this.blah, this);
    // }

    // blah (){
    //     console.log('blah',arguments)
    // }

    calculateOffsetHack (){
        let x,y
        this.offsetPosition = ({x, y} =  this.position)
    }

    move_through_path (path) {
        if (path !== null) {
            this.path = path;
            this.path_step = 0;
        } else {
            this.path = [];
        }
    }
}