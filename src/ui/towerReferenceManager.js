import stampit from 'stampit'


import GLOBALS from '../config/globals'

export var TowerReferenceManager = stampit()
	.methods({
		getTower(){
			return this.tower
		},
		setTower(tower){
			this.tower = tower
		}
	})
	.init(function ({}, {args, instance, stamp}) {
		Object.assign(instance, {
			tower: null
		})
	})