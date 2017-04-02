import Prefab from './prefab'

export default class extends Prefab {
    constructor (game_state, name, position, properties) {
        super(game_state, name, position, properties);
        
        this.anchor.setTo(0.5);
        this.scale.setTo(0.666, 0.5);
        
        this.walking_speed = +properties.walking_speed;

        this.game_state.game.physics.arcade.enable(this);
        // change the size and position of the collision box
        this.body.setSize(12, 12, 0, 4);
        this.body.collideWorldBounds = true;
            
        // set anchor point to be the center of the collision box
        this.anchor.setTo(0.5, 0.5);
        
        this.path = [];
        this.path_step = -1;
        
        this.game_state.signals.playerMove.add(this.move_to, this);
    }

    update () {
        // console.log(this.path, this.path_step)
        let next_position, velocity, tempPath;
        this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
        
        if (this.path.length > 0) {
            next_position = this.path[this.path_step];
            
            if (!this.reached_target_position(next_position)) {
                velocity = new Phaser.Point(next_position.x - this.position.x,
                                       next_position.y - this.position.y);
                velocity.normalize();
                this.body.velocity.x = velocity.x * this.walking_speed;
                this.body.velocity.y = velocity.y * this.walking_speed;
            } else {
                this.position.x = next_position.x;
                this.position.y = next_position.y;
                if (this.path_step < this.path.length - 1) {
                    this.path_step += 1;
                } else {
                    this.path_step = 0;

                    // loop
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                    // this.body.x = this.game_state.globalOffset.x;
                    // this.body.y = this.game_state.globalOffset.y;
                    this.x = 8;
                    this.y = 8;
                    this.move_to()
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
        console.log('player position',this.position)
        this.calculateOffsetHack()
        this.game_state.pathfinding.find_path(this.position, target_position, this.move_through_path, this);
    }

    calculateOffsetHack (){
        let x,y
        this.offsetPosition = ({x, y} =  this.position)
    }

    move_through_path (path) {
        console.log('mtp', path)
        if (path !== null) {
            this.path = path;
            this.path_step = 0;
        } else {
            this.path = [];
        }
    }
}