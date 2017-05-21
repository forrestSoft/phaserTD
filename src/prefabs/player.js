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
        this.body.setSize(8, 14, 8, 12);
        this.body.collideWorldBounds = true;
            
        // set anchor point to be the center of the collision box
        this.anchor.setTo(0.5, 0.5);
        
        this.path = [];
        this.path_step = -1;

        this.animations.add('walkNorth', [0,1,2], 10, true)
        this.animations.add('walkEast', [3,4,5], 10, true)
        this.animations.add('walkSouth', [6,7,8], 10, true)
        this.animations.add('walkWest', [9,10,11], 10, true)

        this.buildHealthBar()
        
        GLOBALS.signals.creepPathReset.add(this.reset,this)

        this.life = properties.health
        this.fullLife = properties.health
        this.value = properties.gold
    }

    hit(damage = 1){
        // console.log(`hit for ${damage}`)
        this.life -= damage
        this.updateHealthMeter()

        if(this.life <= 0){
            let explosionAnimation = GLOBALS.kabooms.getFirstExists(false);
            explosionAnimation.reset(this.x, this.y);
            explosionAnimation.play('kaboom', 30, false, true);
            this.kill()
            // this.destroy()
            GLOBALS.signals.creepKilled.dispatch(this.gold)
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

    move_through_path (path) {
        if (path !== null) {
            this.path = path;
            this.path_step = 0;
        } else {
            this.path = [];
        }
    }

    reset(){
        this.path = GLOBALS.stars.get_path('creep')

        if(this.path_step == -1){
            this.path_step = 0
        }else{
            this.path.some((point,i)=>{
                if(this.position.x < point.x && this.position.y < point.y){
                    this.path_step = i
                    return true
                }else{
                    return false
                }
            })
        }
    }

    updateHealthMeter(){
        this.healthMeter.width = 8*((this.fullLife-this.life)/this.fullLife)
    }

    buildHealthBar(){
        this.healthBar = game.make.graphics()
        this.healthBar.beginFill(0x3399ff)
        this.healthBar.drawRect(0,0,10,4)

        this.healthMeter = game.make.graphics()
        this.healthMeter.beginFill(0xff0000)
        this.healthMeter.drawRect(0,0,10,4)
        this.healthMeter.width = 0

        this.healthBar.addChild(this.healthMeter)
        this.addChild(this.healthBar)

        this.healthBar.x = -5
        this.healthBar.y = -17
    }
}