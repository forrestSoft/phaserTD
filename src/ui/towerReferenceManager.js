import stampit from 'stampit'


import GLOBALS from '../config/globals'

export var TowerReferenceManager = stampit()
	.methods({
		getTower(){
			console.log('gt',this)
			return this.tower || -1
		},
		setTower(tower){
			console.log('t',this)
			this.tower = tower
		}
	})
	.init(function ({}, {args, instance, stamp}) {
		Object.assign(instance, {})
	})