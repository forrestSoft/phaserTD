import stampit from 'stampit'
import Phaser from 'phaser'

import {Points} from '../utils'

import GLOBALS from '../config/globals'

let CWatcher = stampit()
	.methods({
		process({a, b}, loop){
			if(!loop){
				game.physics.arcade.overlap(a, b, this.dispatchCollision, this.processCallBack, this)
			}else{
				GLOBALS.splashes.forEach((splash)=>{
					game.physics.arcade.overlap(a,splash.sprite, this.dispatchCollision, this.processCallBack, this)
				})
			}
		}
	})
	.init(function ({dispatchCollision, processCallBack, name, loop}, {args, instance, stamp}) {
		Object.assign(instance, {dispatchCollision, processCallBack, name, loop})
	})

export const  CollisionManager = stampit()
	.methods({
		buildWatchers(){
			this.watchers = {
				creepsToBullets: CWatcher({
					name: 'creepsToBullets',
					dispatchCollision: this.collisionCreepToBullet,
					processCallBack: this.processCallBack,
					loop: false
				}),
				creepsToSplash: CWatcher({
					name: 'creepsToSplash',
					dispatchCollision: this.collisionSplashToCreep,
					processCallBack: null,
					loop: true
				})
			}
		},
		collide(){
			GLOBALS.splashes.forEach((a,i)=>{
				if(a.frame > 1){
					GLOBALS.splashes[i].sprite.destroy()
					GLOBALS.splashes.splice(i,1)
					return
				}

				a.frame++
			})

			Object.keys(this.watchers).forEach((w)=>{
				let values = this.arrangeValues(w)
				if(values == -1){
					return 
				}

				let watcher = this.watchers[w]
				watcher.process(values, watcher.loop)
			})
		},
		arrangeValues(name){
			let creeps, bullets,splash, returnValue
			creeps = GLOBALS.groups.creeps
			bullets = game.bullets
			splash = GLOBALS.splashes

			switch(name){
				case 'creepsToSplash':
					if(creeps.children.length <= 0 || splash.length <= 0){
						return -1
					}

					returnValue = {a: creeps, b: splash}
				break

				case 'creepsToBullets':
					if(creeps.children.length <= 0 || bullets.length <= 0){
						return -1
					}
					returnValue = {a: creeps, b: bullets}
				break
			}
			return returnValue
		}
	})
	.init(function ({}, {args, instance, stamp}) {
		let proccessors = Proccessors()
		Object.assign(instance, {
			collisionSplashToCreep: proccessors.collisionSplashToCreep,
			collisionCreepToBullet: proccessors.collisionCreepToBullet,
			processCallBack: proccessors.processCallBack
		})

		instance.buildWatchers()
	})

let Proccessors = stampit()
	.methods({
		processCallBack (a, b){
			let bullet, creep
			if(a.weapon){
				// console.log(1)
				bullet = a
				creeep = b
			}else{
				// console.log(2)
				bullet = b
				creep = a
			}
			if(bullet.weapon.target !== creep){
				// console.log(bullet,creep)
			}
			return (bullet.weapon.target == creep)
		},
		collisionCreepToBullet (objA,objB){
			let player, bullet
			if(objA.key == 'weapons'){
				bullet = objA
				player = objB
			}else{
				bullet = objB
				player = objA
			}
			if(bullet.type == 45){
				let splash = {
					sprite: game.make.sprite(bullet.centerX, bullet.centerY-6,'ms', 32),
					frame: 0
				}
				splash.sprite.anchor.setTo(0.5, 0.5)
				splash.sprite.scale.setTo(1,1)
				splash.alpha = 0
				splash.sprite.damageValue = bullet.damageValue
				game.physics.arcade.enable(splash.sprite)
				splash.sprite.body.syncBounds = true
				GLOBALS.groups.board.addChild(splash.sprite)
				GLOBALS.splashes.push(splash)
				window.splash = splash

				let boom = game.make.sprite(player.centerX, player.centerY, 'kaboom', 0, GLOBALS.groups.board);
				boom.anchor.setTo(0.5, 0.5);
				boom.scale.setTo(.5,.5)
				boom.alpha = .5
				boom.tint = 0xffa500
				boom.animations.add('kaboom')
				GLOBALS.groups.board.addChild(boom)
				boom.play('kaboom', 30, false, true);
			}

			bullet.kill()
			bullet.body.x = 0
			bullet.body.y = 0
			player.hit(bullet.damage[bullet.level])
		},
		collisionSplashToCreep (splash, creep){
			creep.hit(splash.damageValue)
		}
	})

		// game.time.slowMotion = 1.5