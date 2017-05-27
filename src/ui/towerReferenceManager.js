import stampit from 'stampit'


import GLOBALS from '../config/globals'

export var TowerReferenceManager = stampit()
	.methods({
		setup(){
			// debugger
			GLOBALS.signals.towerLeveled.add(this.clearTower, this)
		},
		clearTower(){
			this.setTower(null)
		},
		getTower(){
			return this.tower
		},
		setTower(tower){
			console.log('set',tower)
			this.tower = tower
		}
	})
	.init(function ({}, {args, instance, stamp}) {
		Object.assign(instance, {
			tower: null
		})
	})