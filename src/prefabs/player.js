import Prefab from './prefab'

import GLOBALS from '../config/globals'

export default class extends Prefab {
	shadeColor2(color, percent) {
		let f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
		return (0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
	}
	constructor(game_state, name, position, properties) {
		super(game_state, name, position, properties)
		// this.createBitMap()
		// this.createBitMap('female02_rouge_spritesheet', 'new')

		this.data.id = game_state.counters.creepID++
		this.data.beenHitBy = {}

		this.anchor.setTo(0.5)
		this.scale.setTo(0.666, 0.5)

		this.walking_speed = +properties.walking_speed
		this.level = properties.level || 0
		// debugger

		// this.tint = '0x' + this.shadeColor2('#ff0000', -1)
		// this.createBitMap('female02_rouge_spritesheet', 'new')
		this.game_state.game.physics.arcade.enable(this)

		// change the size and position of the collision box
		this.body.setSize(8, 14, 8, 12)
		this.body.collideWorldBounds = true

		this.anchor.setTo(0.5, 0.5)

		this.path = []
		this.path_step = -1

		this.animations.add('walkNorth', [0, 1, 2], 10, true)
		this.animations.add('walkEast', [3, 4, 5], 10, true)
		this.animations.add('walkSouth', [6, 7, 8], 10, true)
		this.animations.add('walkWest', [9, 10, 11], 10, true)

		GLOBALS.signals.creepPathReset.add(this.reset, this)

		this.life = properties.health
		this.fullLife = properties.health
		this.value = properties.gold

		this.buildHealthBar()
	}
	postUpdate() {
		// console.log(3,this.position,this.body.position)

        if (this.customRender)
        {
            this.key.render();
        }

        if (this.components.PhysicsBody)
        {
            Phaser.Component.PhysicsBody.postUpdate.call(this);
        }
        // console.log(4,this.position, this.body.position)
        if(!window.ii){
        	window.ii = 1
        	window.iii = 2
        }
        window.ii += 1
        if(window.ii >= window.iii){
        	// debugger
        }
		// this.y = this.body.y
        if (this.components.FixedToCamera)
        {
            Phaser.Component.FixedToCamera.postUpdate.call(this);
        }

        for (var i = 0; i < this.children.length; i++)
        {
            this.children[i].postUpdate();
        }
        // console.log(5,this.x,this.y, this.body.x, this.body.y)
    }

	preUpdate() {
		// console.log(1,this.x,this.y)
	    if (this.pendingDestroy)
	    {
	        this.destroy();
	        return;
	    }

	    this.previousPosition.set(this.world.x, this.world.y);
	    this.previousRotation = this.rotation;

	    if (!this.exists || !this.parent.exists)
	    {
	        this.renderOrderID = -1;
	        return false;
	    }

	    this.world.setTo(this.game.camera.x + this.worldTransform.tx, this.game.camera.y + this.worldTransform.ty);

	    if (this.visible)
	    {
	        this.renderOrderID = this.game.stage.currentRenderOrderID++;
	    }

	    if (this.animations)
	    {
	        this.animations.update();
	    }

	    if (this.body)
	    {
	        this.body.preUpdate();
	    }

	    this.preUpdateChildren();
	    // console.log(2,this.x,this.y)
	    return true;

	}
	hit(damage = 1) {
		this.life -= damage
		// console.log(`hit for ${damage}, life left ${this.life}`, this.data.id)
		this.updateHealthMeter()

		if (this.life <= 0) {
			let explosionAnimation = GLOBALS.kabooms.getFirstExists(false)

			explosionAnimation.reset(this.x, this.y)
			explosionAnimation.play('kaboom', 30, false, true)

			this.kill()
			GLOBALS.signals.creepKilled.dispatch(this.gold)
		}
	}

	update() {
		// console.log(this.x,this.y)
		// debugger
		if (!GLOBALS.stars.get('creep').hasPath) {
			return
		}

		if (this.path_step == -1) {
			this.path_step = 0
		}

		this.path = GLOBALS.stars.get_path('creep')

		let next_position, velocity, tempPath
		this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision)

		if (this.path.length > 0) {
			next_position = this.path[this.path_step]

			if (!this.reached_target_position(next_position)) {
				velocity = new Phaser.Point(next_position.x - this.position.x, next_position.y - this.position.y)
				velocity.normalize()
				this.velocity = velocity
				// debugger
				let s, n
				n = Math.atan2(-velocity.y, -velocity.x)
				if (n < -3 || n > 3) {
					s = 'East'
				} else if (n < -1.5) {
					s = 'South'
				} else if (n > 1.5) {
					s = 'North'
				} else {
					s = 'West'
				}

				this.animations.play('walk' + s)

				this.body.velocity.x = velocity.x * this.walking_speed
				this.body.velocity.y = velocity.y * this.walking_speed
			} else {
				this.position.x = next_position.x
				this.position.y = next_position.y
				if (this.path_step < this.path.length - 1) {
					this.path_step += 1
				} else {
					GLOBALS.signals.creepReachedGoal.dispatch()
					this.destroy()
				}
			}
		}
		// console.log('--', this.x,this.y)
	}

	reached_target_position(target_position) {
		let distance = Phaser.Point.distance(this.position, target_position)
		return distance < 1
	}

	move_through_path(path) {
		if (path !== null) {
			this.path = path
			this.path_step = 0
		} else {
			this.path = []
		}
	}

	reset() {
		this.path = GLOBALS.stars.get_path('creep')

		if (this.path_step == -1) {
			this.path_step = 0
		} else {
			this.path.some((point, i) => {
				console.log('l', point, this.position)
				if (this.position.x < point.x && this.position.y < point.y) {
					this.path_step = i
					return true
				} else {
					return false
				}
			})
		}
	}

	updateHealthMeter() {
		this.healthMeter.width = 8 * ((this.fullLife - this.life) / this.fullLife)
		this.text.setText(this.life)
	}

	buildHealthBar() {
		this.healthBar = game.make.graphics()
		this.healthBar.beginFill(0x3399ff)
		this.healthBar.drawRect(0, 0, 10, 4)

		this.healthMeter = game.make.graphics()
		this.healthMeter.beginFill(0xff0000)
		this.healthMeter.drawRect(0, 0, 10, 4)
		this.healthMeter.width = 0

		this.healthBar.addChild(this.healthMeter)
		this.addChild(this.healthBar)

		this.healthBar.x = -5
		this.healthBar.y = -17
		var style = {
			font: '12px Arial',
			fontWeight: 'bold',
			align: 'center',
			fill: `#ffffff`
		}
		let textValue = this.life
		this.text = game.make.text(0,0, textValue, style)
		this.text.anchor.set(0.5)
		this.text.scale.setTo(1,1)
		this.addChild(this.text)
	}
}
