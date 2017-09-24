import stampit from 'stampit'

import GLOBALS from '../config/globals'

export var TowerReferenceManager = stampit()
	.methods({
		defaults() {},
		setup() {
			// debugger
			GLOBALS.signals.towerLeveled.add(this.clearTower, this)
		},
		clearTower() {
			this.setTower(null)
		},
		getTower() {
			return this.tower
		},
		setTower(tower) {
			if (tower == null) {
				this.tower = null
				return
			}
			// debugger
			let sprite = tower
			if (tower.sprite) {
				sprite = tower.sprite
			}

			let data = sprite.data
			let t = {}

			let b = ['realTower', 'towerType'].forEach(prop => (t[prop] = data[prop]))
			// console.log('t',t)
			this.tower = tower
		}
	})
	.init(function({}, { args, instance, stamp }) {
		Object.assign(instance, {
			tower: null
		})
	})
